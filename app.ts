// este fichero lo transpila el tsc y lo convierte en el app.js que es el punto de entrada
import express from 'express'
import cors from 'cors'
import * as rsa from './rsa'
import * as bigintConversion from 'bigint-conversion'

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())

app.listen(port, function () {
  console.log(`listening on port ${port}`)
})

console.log('hello Wolrd')

// definir un endpoint
app.get('/', (req, res) => {
  res.send('hello World')
})
app.get('/test', (req, res) => {
  res.send('hello World test')
})
app.get('/user', (req, res) => {
  console.log('endpoint de /user')
  const user = {
    username: 'ferran',
    info: 'prueba get que envia un json'
  }
  res.json(user)
})
app.get('/rsa', async function (req, res) {
  const rsaKeys = await rsa.generatekeys(2048)
  console.log(rsaKeys)

  const publicKey = {
    llave: 'Pública',
    e: bigintConversion.bigintToHex(rsaKeys.publicKey.e),
    n: bigintConversion.bigintToHex(rsaKeys.privKey.n)
  }
  res.json(publicKey)
})
// pruebas de post y get de messages
app.post('/messages', (req, res) => {
  const message = req.body.message
  console.log('Message received @/messages: ', message)
  res.sendStatus(200)
})
app.get('/messages', (req, res) => {
  const message = 'Hello from the server!'
  res.json({ message })
})
app.post('/pubkey', (req, res) => {
  const message = req.body.message
  const publicKey = JSON.parse(message)
  // console.log('Message received:', message)
  // console.log('pubkey received:', publicKey)
  const e = publicKey.e
  const n = publicKey.n
  console.log('pubkey')
  console.log('Values of e: ', e)
  console.log('Values of n: ', n)
  res.sendStatus(200)
})

app.post('/privkey', (req, res) => {
  const message = req.body.message
  const privateKey = JSON.parse(message)
  // console.log('Message received:', message)
  // console.log('pubkey received:', publicKey)
  const d = privateKey.d
  const n = privateKey.n
  console.log('privkey')
  console.log('Values of e: ', d)
  console.log('Values of n: ', n)
  res.sendStatus(200)
})
