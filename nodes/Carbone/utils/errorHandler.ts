import { NodeApiError, JsonObject, INode } from 'n8n-workflow';

export class CarboneErrorHandler {
	static handleApiError(error: unknown, node: INode): NodeApiError {
		const carboneMessage = CarboneErrorHandler.extractCarboneMessage(error);
		if (carboneMessage) {
			return new NodeApiError(node, error as JsonObject, { message: carboneMessage });
		}
		return new NodeApiError(node, error as JsonObject);
	}

	private static extractCarboneMessage(error: unknown): string | undefined {
		const err = error as Record<string, unknown>;

		// n8n stores the API response body in `context.data`
		const data = (err?.context as Record<string, unknown>)?.data;
		return CarboneErrorHandler.parseBodyError(data);
	}

	private static parseBodyError(body: unknown): string | undefined {
		if (typeof body === 'string') {
			try {
				const parsed = JSON.parse(body) as Record<string, unknown>;
				if (typeof parsed?.error === 'string') return parsed.error;
			} catch {
				// not JSON
			}
		} else if (body !== null && typeof body === 'object') {
			const obj = body as Record<string, unknown>;
			if (typeof obj?.error === 'string') return obj.error;
		}
		return undefined;
	}
}
