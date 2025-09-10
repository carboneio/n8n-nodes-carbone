import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function templateSearch(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('carboneApi');

	try {
		const response = await this.helpers.request({
			method: 'GET',
			url: `${credentials.apiUrl}/templates`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'carbone-version': credentials.carboneVersion,
			},
			// Ensure the helper parses the response as JSON
			json: true,
		});

		// Extract templates from API response
		const templates = Array.isArray(response?.data) ? response.data : [];

		if (filter) {
			const results: INodeListSearchItems[] = [];

			for (const template of templates) {
				const templateId = template.id || 'unknown';
				const templateName =
					typeof template.name === 'string' && template.name.trim().length > 0
						? template.name
						: templateId;

				const displayName =
					templateName && templateName !== templateId
						? `${templateId} - ${templateName}`
						: `${templateId}`;

				if (templateName.toString().toLowerCase().includes(filter.toLowerCase())) {
					results.push({
						name: displayName,
						value: templateId,
					});
				}
			}

			return {
				results,
			};
		} else {
			return {
				results: templates.map((template: any) => {
					const templateId = template.id || 'unknown';
					const templateName =
						typeof template.name === 'string' && template.name.trim().length > 0
							? template.name
							: templateId;

					const displayName =
						templateName && templateName !== templateId
							? `${templateId} - ${templateName}`
							: `${templateId}`;

					return {
						name: displayName,
						value: templateId,
					};
				}),
			};
		}
	} catch (error) {
		throw new NodeOperationError(this.getNode(), 'Failed to fetch templates from Carbone API', {
			level: 'warning',
		});
	}
}
