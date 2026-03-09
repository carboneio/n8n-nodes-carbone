import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function templateSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('carboneApi');

	try {
		const qs: Record<string, string> = {};
		if (filter) {
			qs.search = filter;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
			method: 'GET',
			url: `${credentials.apiUrl}/templates`,
			qs,
			json: true,
		});

		// Extract templates from API response
		const templates = Array.isArray(response?.data) ? response.data : [];

		return {
			results: templates.map((template: { id?: string; name?: string; versionId?: string }) => {
				const templateId = template.id;
				const versionId = template.versionId;
				const templateName =
					typeof template.name === 'string' && template.name.trim().length > 0
						? template.name
						: 'unnamed';

				const displayId = templateId ?? versionId ?? 'unknown';
				const displayName = `${templateName} - ${displayId} - ${versionId ?? displayId}`;

				return {
					name: displayName,
					value: templateId ?? versionId ?? 'unknown',
				};
			}),
		};
	} catch {
		throw new NodeOperationError(this.getNode(), 'Failed to fetch templates from Carbone API', {
			level: 'warning',
		});
	}
}
