// este fichero lo transpila el tsc y lo convierte en el app.js que es el punto de entrada
import express from 'express'
import cors from 'cors'
import * as rsa from './rsa'
import { RsaKeyPair, generatekeys } from './rsa'
import * as bigintConversion from 'bigint-conversion'
import bcu from 'bigint-crypto-utils'
import { RsaPrivKey, RsaPubKey } from './my-Client/src/app/utils/rsa'
const bodyParser = require('body-parser');

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
let serverKeyPair: RsaKeyPair;
let publicKeyCli: any = {}
let privKeyCli: any = {}


//generamos las llaves del Servidor
async function generateServerKeys() {
  const bitLength = 1024;
  serverKeyPair = await generatekeys(bitLength);
  console.log('Llaves del servidor generadas:', serverKeyPair);
}
generateServerKeys().catch((error) => {
  console.error('Error al generar las llaves del servidor:', error);
});



//generamos las llaves del Servidor

//dejar al servidor esperando comunicación del cliente
app.listen(port, function () {
  console.log(`listening on port ${port}`)
})
console.log('Server activo')


//PUBLIC KEY pots y get
// prueba de enviar las llaves pública y privada del cliente
app.post('/pubkey', (req, res) => {
  const message = req.body.message
  publicKeyCli = JSON.parse(message)
  // console.log('Message received:', message)
  // console.log('pubkey received:', publicKey)
  const e = publicKeyCli.e
  const n = publicKeyCli.n
  console.log('pubkey')
  console.log('Values of e: ', e)
  console.log('Values of n: ', n)
 
  res.sendStatus(200)
})
app.get('/getServerPublicKey', (req, res) => {
  res.json({
    publicKey: {
      e: serverKeyPair.publicKey.e.toString(),
      n: serverKeyPair.publicKey.n.toString(),
    },
  });
});


//PRIVATE KEY post y get
app.post('/privkey', (req, res) => {
  const message = req.body.message
  privKeyCli= JSON.parse(message)
  // console.log('Message received:', message)
  // console.log('pubkey received:', publicKey)
  const d = privKeyCli.d
  const n = privKeyCli.n
  //privateKeyCliente= new rsa.RsaPrivKey(d,n)
  console.log('privkey')
  console.log('Values of d: ', d)
  console.log('Values of n: ', n)
  res.sendStatus(200)
})
app.get('/getServerPrivateKey', (req, res) => {
  res.json({
    privKey: {
      d: serverKeyPair.privKey.d.toString(),
      n: serverKeyPair.publicKey.n.toString(),
    },
  });
});



//Mensaje encriptado
//post encriptado por el cliente, decript con privateKeyCliente
//get encriptado por el servidor, encriptar con publicKeyServer
app.post('/encriptao', (req, res) => {
  
  //obtener el mensaje, recuperar el segundo parametro del json {"mensajeEncriptado": "el numero de encriptado en string"}
  //transformar el numero en string en el segundo parametro a bigint para poder hacer el decrypt del bigint
  const message = req.body.message
  console.log('mensajeEncriptado recibido:', message)
  const jsonObject = JSON.parse(message)
  console.log('jsonObject:',jsonObject)
  const encryptedMessageByServer = jsonObject.mensajeEncriptado
  console.log('encryptedMessageByServer: ',encryptedMessageByServer)
  const encryptedMessageByServerToBigInt =BigInt(encryptedMessageByServer)
  console.log('bigint: ',encryptedMessageByServerToBigInt)

  //recuperamos la llave privada que a enviado el cliente en otro post
  const d = BigInt(privKeyCli.d)
  const n = BigInt(privKeyCli.n)
  console.log('d:',d)
  console.log('#n:',n)
  const pKeyC = new RsaPrivKey(d,n)
  console.log('pKeyC:',pKeyC)
  
  //usamos la llave privada para activar el decrypt, mostramos por pantalla el mensaje desencriptado pasado a texto
  const messagedecrypted = pKeyC.decrypt(encryptedMessageByServerToBigInt)
  //console.log('messagedecrypted:',messagedecrypted)
  const messagedecryptedtoText = bigintConversion.bigintToText(messagedecrypted)
  console.log('messagedecryptedtoText: ',messagedecryptedtoText)
})
app.get('/encriptao', (req, res) => {
  const message = 'Mensaje a encriptar desde el servidor';
  console.log('publicKey con la que se encripta: ', serverKeyPair.publicKey)
  const encryptedMessage = serverKeyPair.publicKey.encrypt(bigintConversion.textToBigint(message))
  console.log('encryptedMessageByServer:', encryptedMessage)
  res.json({ encryptedMessage: encryptedMessage.toString() });
});


app.post('/firma', (req, res) => {
  //obtener el mensaje, recuperar el segundo parametro del json {"mensajeEncriptado": "el numero de encriptado en string"}
  //transformar el numero en string en el segundo parametro a bigint para poder hacer el decrypt del bigint
  console.log('@@@@@@ post de firma')
  console.log('#####')
  const message = req.body.message
  console.log('mensajeFirmado recibido:', message)
  const jsonObject = JSON.parse(message)
  console.log('jsonObject:',jsonObject)
  const SignedMessageByServer = jsonObject.mensajeFirmado
  console.log('SignedMessageByServer: ',SignedMessageByServer)
  const SignedMessageByServerToBigInt =BigInt(SignedMessageByServer)
  console.log('bigint: ',SignedMessageByServerToBigInt)

  //recuperamos la llave publica que a enviado el cliente en otro post
  const e = BigInt(publicKeyCli.e)
  const n = BigInt(publicKeyCli.n)
  console.log('d:',e)
  console.log('n:',n)
  const pKeyC = new RsaPubKey(e,n)
  console.log('pKeyC:',pKeyC)
  
  //usamos la llave publica para activar el verify, mostramos por pantalla el mensaje pasado a texto
  const messageVerified = pKeyC.verify(SignedMessageByServerToBigInt)
  //console.log('messagedecrypted:',messagedecrypted)

  const messageVerifiedtoText = bigintConversion.bigintToText(messageVerified)
  console.log('messageVerifiedtoText: ',messageVerifiedtoText)
})
app.get('/firma', (req, res) => {
  const mensaje = 'Mensaje firmado por el Servidor'
  console.log('mensaje: ', mensaje)
  const mensajeFirmado = serverKeyPair.privKey.sign(bigintConversion.textToBigint(mensaje))
  console.log('firmado: ', mensajeFirmado)
  res.json({mensajeFirmado:mensajeFirmado.toString()})
 
})

















//
//PRUEBAS 
//




// pruebas de post y get de messages para comunicar el Cliente-Servidor
app.post('/messages', (req, res) => {
  const message = req.body.message
  console.log('Message received  @/messages: ', message)
  res.sendStatus(200)
})

app.get('/messages', (req, res) => {
  const message = 'Hello from the server!'
  res.json({ message })
})


// para comprobar el funcionamiento del módulo rsa.ts
app.get('/rsa', async function (req, res) {
  // const rsaKeys = await rsa.generatekeys(2048)
  /*
  const publicKey = new rsa.RsaPubKey(
    65537n,
    98526359046374483657122842688277566342026786295198877740940697423192614469767n
  )
  const privKey = new rsa.RsaPrivKey(
    90753936197147999678495119467831177004288137908663660476743391124837520490169n,
    98526359046374483657122842688277566342026786295198877740940697423192614469767n
  )*/
  const msg = 'Mensaje a encriptar desde el servidor'
  // Encriptar el mensaje utilizando la clave pública
  // const encrypted = rsaKeys.publicKey.encrypt(bigintConversion.textToBigint(msg))
  const encrypted = serverKeyPair.publicKey.encrypt(bigintConversion.textToBigint(msg))
  // Desencriptar el mensaje encriptado utilizando la clave privada
  const decrypted = serverKeyPair.privKey.dencrypt(encrypted)
  const texdecrypted = bigintConversion.bigintToText(decrypted)

  // fimar con la llave privada y verificar con la publica
  const firma = serverKeyPair.privKey.sign(bigintConversion.textToBigint(msg))
  const verificado = serverKeyPair.publicKey.verify(firma)
  const textoVerificado = bigintConversion.bigintToText(verificado)

  // console.log(rsaKeys)
  console.log('el msg: ', msg)
  console.log('encrypted: ', encrypted)
  console.log('decrypted: ', decrypted)
  console.log('Decrypted a text:', texdecrypted)
  console.log(' ')
  console.log('firmado: ', firma)
  console.log('verificado: ', verificado)
  console.log('Verificado a text: ', textoVerificado)
})
/*
generatekeys(16).then((keys) => {
  publicKeyServer = keys.publicKey;
  privateKeyServer = keys.publicKey;
  //convertirlas a string para enviar
  publicKeyServer = {
    e: keys.publicKey.e.toString(),
    n: keys.publicKey.n.toString()
  };
  privateKeyServer = {
    d: keys.privKey.d.toString(),
    n: keys.privKey.n.toString()
  };
  console.log('Llave pública generada:', publicKeyServer)
  console.log('Llave privada generada:', privateKeyServer)
}).catch((error) => {
  console.error('Error al generar las llaves:', error)
});
// pruebas de hello world
app.get('/', (req, res) => {
  res.send('hello World')
})
*/