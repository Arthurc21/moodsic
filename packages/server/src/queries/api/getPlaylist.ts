import { ApiClient } from "../../types";

async function getPlaylist(apiClient: ApiClient, playlistId: string) {
    if (apiClient) {
        return await apiClient.get(`/playlists/${playlistId}`).then((res) => res.data)
    }
}

export { getPlaylist }