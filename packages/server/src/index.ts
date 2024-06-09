import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import { getProfile } from './queries/api'
import { getAudioAnalysis } from './queries/api/getAudioAnalysis'
import { ApiClient } from './types'
import { generateRandomString, getApiClient } from './utilities'
import { getAccessToken } from './utilities/getAccessToken'

// initialize configuration
dotenv.config()

let app = express()

const port = process.env.PORT || 8888
const clientId = process.env.CLIENT_ID || ''
const redirectURI = process.env.REDIRECT_URI || ''
const codePath = process.env.CODE_PATH || ''

let accessToken = ''
let code: string | null = null

let apiClient: ApiClient = null

function getCodeFileContent() {
	let content = ''
	fs.readFile(codePath, 'utf-8', function (error, data) {
		if (error) {
			code = null
			// console.log('file error', error)
			fs.appendFile(codePath, '', 'utf-8', function (err) {
				if (err) throw err
			})
			return
		}

		content = data
	})

	return content
}

function createApiClient(accessToken: string) {
	apiClient = getApiClient(accessToken)
}

code = getCodeFileContent()

// async function login() {
// 	// TODO document why this function 'login' is empty
// 	if (code) {
// 		try {
// 			await getAccessToken(code).then((accessToken) => {
// 				console.log('login accessToken', accessToken)
// 				createApiClient(accessToken)
// 			})
// 		} catch (error) {
// 			// console.error(error)
// 		}
// 	}
// }

app.listen(port, () => {
	console.log(`Express server running at http://localhost:${port}/`)
})

app.use('/profile', function (req, res, next) {
	if (apiClient === null) {
		res.redirect('/login')
	}
	next()
})

app.get('/', function (_, res) {
	console.log('/ accessToken', accessToken)
	if (apiClient === null) {
		console.log('redirect /login')
		res.redirect('/login')
	} else {
		console.log('redirect /profile')
		res.redirect('/profile')
	}
})

app.get('/login', async function (req, res) {
	const callbackCode = getCodeFileContent()
	let state = generateRandomString(16)
	// let scope = 'user-read-private user-read-email'
	let scope =
		'user-read-private,user-read-email,playlist-read-private,playlist-modify-private,user-read-playback-state,user-modify-playback-state,user-top-read,user-read-recently-played,user-library-read'

	const params = new URLSearchParams()
	params.append('response_type', 'code')
	params.append('client_id', clientId)
	params.append('scope', scope)
	params.append('redirect_uri', redirectURI)
	params.append('state', state)

	if (callbackCode && callbackCode !== '') {
		await getAccessToken(callbackCode).then((accessToken) => {
			// console.log('/login accessToken', accessToken)
			createApiClient(accessToken)
			res.redirect('/profile')
		})
	} else {
		res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
	}
})

app.get('/callback', async function (req, res) {
	console.log('callback')

	let state = req.query.state || null
	code = (req.query.code as string) || ''
	// console.log('query code', req.query.code)
	fs.writeFile(codePath, code, function (err) {
		if (err) throw err
	})

	if (state === null) {
		const params = new URLSearchParams()
		params.append('error', 'state_mismatch')
		res.redirect('/#' + params.toString())
	} else {
		await getAccessToken(code).then((accessToken) => {
			// console.log('/callback accessToken', accessToken)
			createApiClient(accessToken)
			res.redirect('/profile')
		})
	}
})

app.get('/profile', async function (_, res) {
	const profile = await getProfile(apiClient)
		.then((res) => res)
		.catch((error) => {
			if (error.cause.status === 401) {
				res.redirect('/login')
			}
		})
	console.log('profile', profile?.display_name)
	res.send(profile)
})

app.use('/audio-analysis', bodyParser.urlencoded({ extended: false }))

app.route('/audio-analysis').get(async (req, res) => {
	const { trackId } = req.query
	const audioAnalysis = await getAudioAnalysis(apiClient, trackId as string)
		.then((res) => res)
		.catch((error) => {
			if (error.cause.status === 401) {
				res.redirect('/login')
			}
		})
	res.send(audioAnalysis)
})
