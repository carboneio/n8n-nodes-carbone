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

		// Normalize different possible response structures into an array of templates
		const raw = response as any;
		let templates: any[] = [];

		if (Array.isArray(raw)) {
			templates = raw;
		} else if (raw && raw.success && Array.isArray(raw.data)) {
			templates = raw.data;
		} else if (raw && Array.isArray(raw.data)) {
			templates = raw.data;
		} else if (raw && Array.isArray(raw.templates)) {
			templates = raw.templates;
		}

		// Keep templates as an array to avoid runtime errors later
		if (!Array.isArray(templates)) {
			templates = [];
		}

		if (filter) {
			const results: INodeListSearchItems[] = [];

			for (const template of templates) {
				const templateId = template.id || template.templateId || template._id || 'unknown';
				const fallbackName = template.filename || template.title || templateId || 'Unknown';
				const templateName =
					typeof template.name === 'string' && template.name.trim().length > 0
						? template.name
						: fallbackName;

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
					const templateId = template.id || template.templateId || template._id || 'unknown';
					const fallbackName = template.filename || template.title || templateId || 'Unknown';
					const templateName =
						typeof template.name === 'string' && template.name.trim().length > 0
							? template.name
							: fallbackName;

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
