import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	Icon,
} from 'n8n-workflow';

export class CarboneApi implements ICredentialType {
	name = 'carboneApi';
	displayName = 'Carbone API';
	documentationUrl = 'https://carbone.io/api-reference.html';
	icon: Icon = {
		light: 'file:../nodes/Carbone/carbone.svg',
		dark: 'file:../nodes/Carbone/carbone-dark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description:
				'The API key for Carbone Cloud (https://api.carbone.io). Optional for On-Premise instances that do not require authentication.',
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
			type: 'options',
			options: [
				{
					name: '5 (Latest)',
					value: '5',
				},
			],
			default: '5',
			description:
				'The version of the Carbone API to use. This node requires version 5: without this header the API falls back to an older version that does not support all the node options.',
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
