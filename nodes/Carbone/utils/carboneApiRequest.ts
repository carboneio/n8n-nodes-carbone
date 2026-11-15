import type { IExecuteFunctions, IHttpRequestOptions, ILoadOptionsFunctions } from 'n8n-workflow';

/**
 * Sends a request to the Carbone API with the credential selected by the node's Authentication
 * parameter. `options.url` is a path (e.g. `/templates`), resolved against the credential's API URL.
 */
export async function carboneApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	options: IHttpRequestOptions,
) {
	const credentialType =
		this.getNodeParameter('authentication', 0) === 'oAuth2' ? 'carboneOAuth2Api' : 'carboneApi';
	const { apiUrl } = await this.getCredentials(credentialType);

	return await this.helpers.httpRequestWithAuthentication.call(this, credentialType, {
		...options,
		url: `${apiUrl}${options.url}`,
		// n8n never applies the `authenticate` block of an OAuth2 credential, so the version is sent here
		headers: { ...options.headers, 'carbone-version': '5' },
	});
}
