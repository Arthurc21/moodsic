import axios, { AxiosError, AxiosResponse } from 'axios'

async function getAccessToken(code: string) {
	const clientId = process.env.CLIENT_ID || ''
	const clientSecret = process.env.CLIENT_SECRET || ''
	const redirectURI = process.env.REDIRECT_URI || ''

	const loginApiClient = axios.create({
		baseURL: 'https://accounts.spotify.com',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
		}
	})

	loginApiClient.interceptors.response.use(
		function (response: AxiosResponse) {
			return response
		},
		function (error: AxiosError) {
			return Promise.reject(error)
		}
	)

	const params = new URLSearchParams()

	params.append('grant_type', 'authorization_code')
	params.append('code', code)
	params.append('redirect_uri', redirectURI)

	let token

	try {
		const call = await loginApiClient.post('/api/token', {
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirectURI
		})
		token = call.data['access_token']
	} catch (error) {
		// console.error(error.data)
	}

	return token
}

export { getAccessToken }
