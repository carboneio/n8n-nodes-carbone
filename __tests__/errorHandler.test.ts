import { describe, it, expect } from 'vitest';
import type { INode } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { CarboneErrorHandler } from '../nodes/Carbone/utils/errorHandler';

const node = {
	id: 'test',
	name: 'Carbone',
	type: 'carbone',
	typeVersion: 1,
	position: [0, 0],
	parameters: {},
} as unknown as INode;

describe('CarboneErrorHandler.handleApiError', () => {
	it('surfaces the Carbone error message from an object response body', () => {
		const error = { context: { data: { success: false, error: 'Template not found' } } };
		const result = CarboneErrorHandler.handleApiError(error, node);
		expect(result).toBeInstanceOf(NodeApiError);
		expect(result.message).toBe('Template not found');
	});

	it('surfaces the Carbone error message from a JSON string response body', () => {
		const error = { context: { data: '{"success":false,"error":"Invalid template metadata"}' } };
		const result = CarboneErrorHandler.handleApiError(error, node);
		expect(result.message).toBe('Invalid template metadata');
	});

	it('falls back to a generic NodeApiError when the body has no Carbone message', () => {
		const error = { message: 'socket hang up' };
		const result = CarboneErrorHandler.handleApiError(error, node);
		expect(result).toBeInstanceOf(NodeApiError);
	});
});
