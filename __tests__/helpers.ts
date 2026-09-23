import { vi } from 'vitest';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export interface MockOptions {
	/** Node parameters, keyed by parameter name. Missing keys resolve to the call's fallback value. */
	parameters?: IDataObject;
	/** Credentials returned by getCredentials('carboneApi') */
	credentials?: IDataObject;
	/** Value resolved by helpers.httpRequestWithAuthentication (or an array: one value per call) */
	response?: unknown;
	/** Value resolved by helpers.httpRequest (unauthenticated, e.g. fetching an HTML URL) */
	plainResponse?: unknown;
	/** Input items returned by getInputData() */
	items?: Array<{ json: IDataObject; binary?: IDataObject }>;
}

export interface ExecuteFunctionsMock {
	mock: IExecuteFunctions;
	/** Spy on helpers.httpRequestWithAuthentication, inspect .mock.calls[0][1] for the request */
	httpRequest: ReturnType<typeof vi.fn>;
	/** Spy on helpers.httpRequest (unauthenticated) */
	plainRequest: ReturnType<typeof vi.fn>;
	/** Spy on helpers.prepareBinaryData */
	prepareBinaryData: ReturnType<typeof vi.fn>;
}

// Minimal IExecuteFunctions mock following the n8n core test pattern: call operations with .call(mock, i), assert on the request options
export function createExecuteFunctionsMock(options: MockOptions = {}): ExecuteFunctionsMock {
	const {
		parameters = {},
		credentials = { apiKey: 'test-key', apiUrl: 'https://api.carbone.io', carboneVersion: '5' },
		response = { success: true, data: {} },
		plainResponse = '',
		items = [{ json: {} }],
	} = options;

	const responses = Array.isArray(response) ? [...response] : undefined;
	const httpRequest = vi.fn(async () => (responses ? responses.shift() : response));
	const plainRequest = vi.fn(async () => plainResponse);
	const prepareBinaryData = vi.fn(async (_data: unknown, fileName: string) => ({
		data: '',
		mimeType: 'application/octet-stream',
		fileName,
	}));

	// A Buffer-like object is enough: the code only calls .toString('base64') on it
	const fakeBuffer = { toString: () => 'VEVNUExBVEVfQkFTRTY0' };

	const mock = {
		getNodeParameter: (
			name: string,
			_itemIndex: number,
			fallback?: unknown,
			getOptions?: { extractValue?: boolean },
		) => {
			if (!(name in parameters)) return fallback;
			const value = parameters[name];
			if (
				getOptions?.extractValue &&
				value !== null &&
				typeof value === 'object' &&
				'value' in (value as IDataObject)
			) {
				return (value as IDataObject).value;
			}
			return value;
		},
		getCredentials: async () => credentials,
		getInputData: () => items,
		getNode: () => ({ name: 'Carbone', type: 'carbone', typeVersion: 1 }),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: httpRequest,
			httpRequest: plainRequest,
			assertBinaryData: vi.fn(),
			getBinaryDataBuffer: vi.fn(async () => fakeBuffer),
			prepareBinaryData,
		},
	} as unknown as IExecuteFunctions;

	return { mock, httpRequest, plainRequest, prepareBinaryData };
}

/** Shortcut: the request options object passed to the (n-th) httpRequestWithAuthentication call */
export function requestOptions(httpRequest: ReturnType<typeof vi.fn>, call = 0): IDataObject {
	return httpRequest.mock.calls[call][1] as IDataObject;
}
