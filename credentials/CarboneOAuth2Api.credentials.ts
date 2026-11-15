import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

// One-click sign-in with a Carbone account, Carbone Cloud only:
// - n8n Cloud fills the inherited Client ID and Client Secret with Carbone's managed app (classic OAuth2)
// - without them, n8n 3.2+ registers itself on Carbone Account (Dynamic Client Registration, PKCE)
export class CarboneOAuth2Api implements ICredentialType {
	name = 'carboneOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Carbone OAuth2 API';

	documentationUrl = 'https://carbone.io/api-reference.html';

	icon: Icon = {
		light: 'file:../nodes/Carbone/carbone.svg',
		dark: 'file:../nodes/Carbone/carbone-dark.svg',
	};

	// Opts in to n8n's "Automatic OAuth": a managed app takes precedence, otherwise registration on serverUrl
	dynamicClientRegistration = true;

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://account.carbone.io',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://account.carbone.io/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://account.carbone.io/api/oauth/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'doc_rwd',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
		{
			// The OAuth2 token is a Carbone Cloud token: On-Premise instances use the API key credential
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'hidden',
			default: 'https://api.carbone.io',
		},
	];
}
