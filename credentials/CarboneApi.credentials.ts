import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

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
		{
			displayName: 'Carbone API Version',
			name: 'carboneVersion',
			type: 'string',
			default: '5',
			description: 'The version of the Carbone API to use (4 or 5)',
			placeholder: '5',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'carbone-version': '={{$credentials.carboneVersion}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/templates',
		},
	};
}
