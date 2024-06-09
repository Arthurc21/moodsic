// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
// const port = import.meta.env.PORT
const clientId = import.meta.env.CLIENT_ID
// const redirectURI = import.meta.env.REDIRECT_URI
const redirectURI = 'http://localhost:5173/callback'
const params = new URLSearchParams(window.location.search)
let code = params.get('code')

if (!code) {
	console.log('no code')
	redirectToAuthCodeFlow(clientId)
} else {
	console.log('code', code)
	const accessToken = await getAccessToken(clientId, code)
	const profile = await fetchProfile(accessToken)
	console.log(profile)
	populateUI(profile)
}

async function redirectToAuthCodeFlow(clientId: string) {
	const verifier = generateRandomString(128)
	const challenge = await generateCodeChallenge(verifier)

	localStorage.setItem('verifier', verifier)

	const params = new URLSearchParams()
	params.append('client_id', clientId)
	params.append('response_type', 'code')
	params.append('redirect_uri', redirectURI)
	// 'playlist-read-private,playlist-modify-private,user-read-playback-state,user-modify-playback-state,user-top-read,user-read-recently-played,user-library-read'
	params.append('scope', 'user-read-private user-read-email')
	params.append('code_challenge_method', 'S256')
	params.append('code_challenge', challenge)

	document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
}

function generateRandomString(length: number) {
	let str = ''
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (let i = 0; i < length; i++) {
		str += possible.charAt(Math.floor(Math.random() * possible.length))
	}

	return str
}

async function generateCodeChallenge(codeVerifier: string) {
	const data = new TextEncoder().encode(codeVerifier)
	const digest = await window.crypto.subtle.digest('SHA-256', data)
	return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

async function getAccessToken(clientId: string, code: string) {
	const verifier = localStorage.getItem('verifier')

	const params = new URLSearchParams()
	params.append('client_id', clientId)
	params.append('grant_type', 'authorization_code')
	params.append('code', code)
	params.append('redirect_uri', redirectURI)
	params.append('code_verifier', verifier!)

	const result = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params
	})

	const { access_token } = await result.json()
	return access_token
}

async function fetchProfile(token: string): Promise<any> {
	const result = await fetch('https://api.spotify.com/v1/me', {
		method: 'GET',
		headers: { Authorization: `Bearer ${token}` }
	})

	return await result.json()
}

function populateUI(profile: any) {
	document.getElementById('displayName')!.innerText = profile.display_name
	if (profile.images[0]) {
		const profileImage = new Image(200, 200)
		profileImage.src = profile.images[0].url
		document.getElementById('avatar')!.appendChild(profileImage)
		document.getElementById('imgUrl')!.innerText = profile.images[0].url
	}
	document.getElementById('id')!.innerText = profile.id
	document.getElementById('email')!.innerText = profile.email
	document.getElementById('uri')!.innerText = profile.uri
	document.getElementById('uri')!.setAttribute('href', profile.external_urls.spotify)
	document.getElementById('url')!.innerText = profile.href
	document.getElementById('url')!.setAttribute('href', profile.href)
}

export {}
