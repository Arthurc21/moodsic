import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import fs from 'fs'

function getApiClient(accessToken: string): AxiosInstance {
	const codePath = process.env.CODE_PATH || ''
	const spotifyApiUrl = process.env.SPOTIFY_API_URL
	const apiClient = axios.create({
		baseURL: spotifyApiUrl,
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	function errorHandler(error: AxiosError) {
		// console.error(error?.response?.request)
		const resp = error.response
		let status = ''
		let msg = ''
		let cause = {}

		if (resp && resp.status === 401) {
			console.log('codePath', codePath)
			fs.writeFile(codePath, '', function (err) {
				if (err) throw err
			})

			console.warn('Token expired!')
			status = '401'
			// msg = `${error.request} failed with code 401`
			cause = {
				status: resp.status
			}
		}

		const err = new Error(`Status ${status}`, {
			cause
		})
		// const err = new Error(msg)

		return Promise.reject(err)
		// return status
	}

	function successHandler(response: AxiosResponse) {
		return response
	}

	apiClient.interceptors.response.use(
		(response) => successHandler(response),
		(error) => errorHandler(error)
	)

	return apiClient
}

export { getApiClient }
