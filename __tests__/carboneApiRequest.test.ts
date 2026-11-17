import { describe, it, expect, vi } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { carboneApiRequest } from '../nodes/Carbone/utils/carboneApiRequest';
import { CarboneOAuth2Api } from '../credentials/CarboneOAuth2Api.credentials';
import { createExecuteFunctionsMock, requestOptions } from './helpers';

function mockWith(authentication?: string) {
	const credentials = { apiUrl: 'https://carbone.example.com' };
	const { mock, httpRequest } = createExecuteFunctionsMock({
		parameters: authentication ? { authentication } : {},
		credentials,
	});
	const getCredentials = vi.fn(async () => credentials);
	mock.getCredentials = getCredentials as unknown as typeof mock.getCredentials;
	return { mock, httpRequest, getCredentials };
}

describe('carboneApiRequest', () => {
	it('uses the API key credential by default (workflows created before OAuth2)', async () => {
		const { mock, httpRequest, getCredentials } = mockWith();
		await carboneApiRequest.call(mock, { method: 'GET', url: '/templates' });
		expect(getCredentials).toHaveBeenCalledWith('carboneApi');
		expect(httpRequest.mock.calls[0][0]).toBe('carboneApi');
	});

	it('uses the OAuth2 credential when selected', async () => {
		const { mock, httpRequest } = mockWith('oAuth2');
		await carboneApiRequest.call(mock, { method: 'GET', url: '/templates' });
		expect(httpRequest.mock.calls[0][0]).toBe('carboneOAuth2Api');
	});

	it('sends the OAuth2 token to Carbone Cloud only, never to a URL stored in the credential', async () => {
		const { mock, httpRequest, getCredentials } = mockWith('oAuth2');
		await carboneApiRequest.call(mock, { method: 'GET', url: '/templates' });
		expect(getCredentials).not.toHaveBeenCalled();
		expect(requestOptions(httpRequest).url).toBe('https://api.carbone.io/templates');
	});

	it('resolves the path against the API URL and always sends the API version', async () => {
		const { mock, httpRequest } = mockWith('apiKey');
		await carboneApiRequest.call(mock, {
			method: 'POST',
			url: '/render/template',
			headers: { 'Content-Type': 'application/json' },
		});
		const options = requestOptions(httpRequest);
		expect(options.url).toBe('https://carbone.example.com/render/template');
		expect(options.headers as IDataObject).toEqual({
			'Content-Type': 'application/json',
			'carbone-version': '5',
		});
	});
});

describe('carboneApiRequest - API URL', () => {
	it.each(['https://carbone.local', 'https://carbone.local/', 'https://carbone.local//'])(
		'joins %s and the path with exactly one slash',
		async (apiUrl) => {
			const { mock, httpRequest } = createExecuteFunctionsMock({ credentials: { apiUrl } });
			await carboneApiRequest.call(mock, { method: 'GET', url: '/templates' });
			expect(requestOptions(httpRequest).url).toBe('https://carbone.local/templates');
		},
	);

	it('keeps a path prefix of an On-Premise API URL', async () => {
		const { mock, httpRequest } = createExecuteFunctionsMock({
			credentials: { apiUrl: 'https://intranet.example.com/carbone/' },
		});
		await carboneApiRequest.call(mock, { method: 'GET', url: '/templates' });
		expect(requestOptions(httpRequest).url).toBe('https://intranet.example.com/carbone/templates');
	});
});

describe('CarboneOAuth2Api credential', () => {
	it('pins Carbone Account, the doc_rwd scope and Carbone Cloud, and leaves Client ID/Secret to n8n', () => {
		const credential = new CarboneOAuth2Api();
		const pinned = Object.fromEntries(
			credential.properties.map((p) => [p.name, [p.type, p.default]]),
		);
		expect(pinned).toEqual({
			serverUrl: ['hidden', 'https://account.carbone.io'],
			grantType: ['hidden', 'authorizationCode'],
			authUrl: ['hidden', 'https://account.carbone.io/authorize'],
			accessTokenUrl: ['hidden', 'https://account.carbone.io/api/oauth/token'],
			scope: ['hidden', 'doc_rwd'],
			authQueryParameters: ['hidden', ''],
			authentication: ['hidden', 'header'],
		});
	});

	it('lets a managed app win over registration (no forced useDynamicClientRegistration)', () => {
		// A hidden useDynamicClientRegistration=true would make n8n replace the managed Client ID/Secret
		// with the registered client: the opt-in must be the class field only
		expect(new CarboneOAuth2Api().dynamicClientRegistration).toBe(true);
	});
});
