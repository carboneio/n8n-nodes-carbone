import { describe, it, expect } from 'vitest';
import { NodeOperationError } from 'n8n-workflow';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { TemplateOperations } from '../nodes/Carbone/resources/Template/TemplateOperations';
import { RenderOperations } from '../nodes/Carbone/resources/RenderDocument/RenderOperations';
import { ConvertOperations } from '../nodes/Carbone/resources/ConvertDocument/ConvertOperations';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

type Operation = (this: IExecuteFunctions, i: number) => Promise<INodeExecutionData>;

const templateOps = new TemplateOperations();
const renderOps = new RenderOperations();
const convertOps = new ConvertOperations();

// Accepted as the final answer by every operation: a file download or a JSON answer
const answer = {
	headers: { 'content-disposition': 'attachment; filename="file.pdf"' },
	body: { byteLength: 4 },
	success: true,
	data: {},
};
// Convert first downloads the stored template (the request under test), then renders it
const templateThenAnswer = [new ArrayBuffer(4), answer];

// Every operation that puts a user-supplied ID in the URL path: [name, operation, route, parameters, response]
const routes: Array<[string, Operation, string, IDataObject, unknown]> = [
	['update template', templateOps.updateTemplate, '/template/', { updateFields: {} }, answer],
	['download template', templateOps.downloadTemplate, '/template/', {}, answer],
	['delete template', templateOps.deleteTemplate, '/template/', {}, answer],
	['render by template ID', renderOps.generateDocument, '/render/', { data: '{}' }, answer],
	['get document', renderOps.getDocument, '/render/', {}, answer],
	[
		'convert HTML by template ID',
		convertOps.convertHtmlToPdf,
		'/template/',
		{ htmlSource: 'templateId' },
		templateThenAnswer,
	],
	[
		'convert Office by template ID',
		convertOps.convertOfficeToPdf,
		'/template/',
		{ officeSource: 'templateId' },
		templateThenAnswer,
	],
];

// Values an AI agent ($fromAI) or an upstream item could inject to reach another route or add a query
const attacks = [
	'../templates',
	'x/../../templates?search=a',
	'x?download=true',
	'x#',
	'a/b',
	'%2e%2e',
	'.%2e',
];

describe.each(routes)(
	'%s: the ID stays one path segment',
	(_name, operation, route, parameters, response) => {
		const idParameter = operation === renderOps.getDocument ? 'renderId' : 'templateId';

		function mockWithId(id: string) {
			return createExecuteFunctionsMock({
				parameters: { ...parameters, [idParameter]: id },
				response,
			});
		}

		async function sentUrl(id: string) {
			const { mock, httpRequest } = mockWithId(id);
			await operation.call(mock, 0);
			// Parse like the HTTP client does (WHATWG URL): this is where `..`, `?` and `#` change the request
			return new URL(requestOptions(httpRequest).url as string);
		}

		it.each(attacks)('cannot leave its route with %j', async (id) => {
			const url = await sentUrl(id);
			expect(url.origin).toBe('https://api.carbone.io');
			expect(url.search).toBe('');
			expect(url.hash).toBe('');
			expect(url.pathname.startsWith(route)).toBe(true);
			const segment = url.pathname.slice(route.length);
			expect(segment).not.toContain('/');
			// The API decodes the segment back to exactly the ID the user gave
			expect(decodeURIComponent(segment)).toBe(id);
		});

		// Encoding leaves these unchanged, and the URL parser would resolve them to another route
		it.each(['', '.', '..'])('refuses %j without sending a request', async (id) => {
			const { mock, httpRequest } = mockWithId(id);
			await expect(operation.call(mock, 0)).rejects.toBeInstanceOf(NodeOperationError);
			expect(httpRequest).not.toHaveBeenCalled();
		});

		it.each([
			'1029384756102938475', // Template ID (64-bit integer)
			'a3f1c2d4e5b6a7980a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6071', // Version ID (SHA256)
			'tmpl_123',
		])('sends the valid ID %s unchanged', async (id) => {
			expect((await sentUrl(id)).href).toBe(`https://api.carbone.io${route}${id}`);
		});
	},
);
