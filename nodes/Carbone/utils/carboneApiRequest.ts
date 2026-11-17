import {
	NodeOperationError,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
} from 'n8n-workflow';

/**
 * Sends a request to the Carbone API with the credential selected by the node's Authentication
 * parameter. `options.url` is a path (e.g. `/templates`), resolved against the API URL.
 */
export async function carboneApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	options: IHttpRequestOptions,
) {
	const isOAuth2 = this.getNodeParameter('authentication', 0) === 'oAuth2';
	const credentialType = isOAuth2 ? 'carboneOAuth2Api' : 'carboneApi';
	// An OAuth2 token is a Carbone Cloud token: it is never sent anywhere else, whatever the credential holds
	const apiUrl = isOAuth2
		? 'https://api.carbone.io'
		: (await this.getCredentials(credentialType)).apiUrl;

	return await this.helpers.httpRequestWithAuthentication.call(this, credentialType, {
		...options,
		// An API URL saved with a trailing slash must not give `//templates`
		url: `${String(apiUrl).replace(/\/+$/, '')}${options.url}`,
		// n8n never applies the `authenticate` block of an OAuth2 credential, so the version is sent here
		headers: { ...options.headers, 'carbone-version': '5' },
	});
}

/**
 * Turns a user-supplied ID into exactly one URL path segment. Encoding stops `/`, `?`, `#` and `%2e`
 * from changing the request; the dot segments left after encoding (`.`, `..`) and an empty ID would
 * still resolve to another route, so they are refused.
 */
export function pathSegment(this: IExecuteFunctions, id: string): string {
	const segment = encodeURIComponent(id);
	if (segment === '' || segment === '.' || segment === '..') {
		throw new NodeOperationError(this.getNode(), `Invalid ID: "${segment}"`);
	}
	return segment;
}
