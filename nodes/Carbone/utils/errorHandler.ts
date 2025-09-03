import { NodeApiError, JsonObject } from 'n8n-workflow';

export class CarboneErrorHandler {
	/**
	 * Simple API error handler following n8n best practices
	 * Just wraps the error in NodeApiError without custom messages
	 */
	static handleApiError(error: any, node: any): NodeApiError {
		return new NodeApiError(node, error as JsonObject);
	}
}
