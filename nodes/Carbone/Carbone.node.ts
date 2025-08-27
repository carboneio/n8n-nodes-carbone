import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import {
	resource,
	templateOperations,
	templateFields,
	renderOperations,
	renderFields,
	additionalOptions,
} from './CarboneDescription';

export class Carbone implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Carbone',
		name: 'carbone',
		icon: { light: 'file:carbone.svg', dark: 'file:carbone.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Carbone.io API to manage templates and generate documents',
		defaults: {
			name: 'Carbone',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'carboneApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resource unifiée
			...resource,
			...templateOperations,
			...renderOperations,
			...templateFields,
			...renderFields,

			// Additional Options (masquées par défaut)
			...additionalOptions,
		],
	};
}
