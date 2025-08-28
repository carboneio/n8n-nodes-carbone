import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CarboneApi implements ICredentialType {
	name = 'carboneApi';
	displayName = 'Carbone API';
	documentationUrl = 'https://carbone.io/api-reference.html';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The API key for Carbone.io service',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.carbone.io',
			description: 'The base URL for Carbone.io API (change this for self-hosted instances)',
			placeholder: 'https://api.carbone.io',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: 'Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/template',
			headers: {},
		},
	};
}
