import { AxiosResponse } from 'axios'
import { ApiClient, UserProfile } from '../../types'

async function getProfile(apiClient: ApiClient) {
	if (apiClient) {
		return await apiClient
			.get('/me')
			.then((response: AxiosResponse<UserProfile>) => response.data)
			.catch((error) => {
				throw error
			})
	}
}

export { getProfile }
