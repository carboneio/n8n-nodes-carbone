import { NodeApiError } from 'n8n-workflow';

export class CarboneErrorHandler {
	static handleApiError(error: any, operation: string, itemIndex: number): NodeApiError {
		// Handle specific HTTP status codes with custom messages
		if (error.httpCode === '401') {
			return new NodeApiError({ name: 'Carbone' } as any, error, {
				message: 'Authentication failed',
				description: 'Please check your Carbone API credentials and try again.',
			});
		}

		if (error.httpCode === '404') {
			return new NodeApiError({ name: 'Carbone' } as any, error, {
				message: 'Resource not found',
				description: `The requested resource could not be found while trying to ${operation}. Please check your parameters.`,
			});
		}

		if (error.httpCode === '429') {
			return new NodeApiError({ name: 'Carbone' } as any, error, {
				message: 'Rate limit exceeded',
				description: 'Too many requests to Carbone API. Please wait and try again later.',
			});
		}

		if (error.httpCode && error.httpCode >= '500') {
			return new NodeApiError({ name: 'Carbone' } as any, error, {
				message: 'Carbone server error',
				description: `The Carbone API encountered a server error while trying to ${operation}. Please try again later.`,
			});
		}

		// Generic API error
		return new NodeApiError({ name: 'Carbone' } as any, error, {
			message: `API error while trying to ${operation}`,
			description: error.message || 'An unexpected error occurred with the Carbone API.',
		});
	}
}
