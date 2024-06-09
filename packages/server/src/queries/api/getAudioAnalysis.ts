import { ApiClient } from '../../types'

async function getAudioAnalysis(apiClient: ApiClient, trackId: string) {
	if (apiClient) {
		return await apiClient
			.get(`/audio-analysis/${trackId}`)
			.then((response) => response.data)
			.catch((error) => {
				throw error
			})
	}
}

export { getAudioAnalysis }
