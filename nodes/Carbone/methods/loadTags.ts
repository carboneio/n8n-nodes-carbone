import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function loadTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('carboneApi');

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'carboneApi', {
			method: 'GET',
			url: `${credentials.apiUrl}/templates/tags`,
			json: true,
		});

		const tags: Array<{ name: string }> = Array.isArray(response?.data) ? response.data : [];

		return tags.map((tag) => ({ name: tag.name, value: tag.name }));
	} catch {
		throw new NodeOperationError(this.getNode(), 'Failed to fetch tags from Carbone API', {
			level: 'warning',
		});
	}
}
