// este fichero lo transpila el tsc y lo convierte en el app.js que es el punto de entrada
import express from 'express'
import cors from 'cors'
import * as rsa from './rsa'
import { RsaKeyPair, generatekeys } from './rsa'
import * as bigintConversion from 'bigint-conversion'
import bcu from 'bigint-crypto-utils'

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())
let serverKeyPair: RsaKeyPair;
//generamos las llaves del Servidor
async function generateServerKeys() {
  const bitLength = 2048;
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
  const privateKey = JSON.parse(message)
  // console.log('Message received:', message)
  // console.log('pubkey received:', publicKey)
  const d = privateKey.d
  const n = privateKey.n
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
})
app.get('/encriptao', (req, res) => {
  const message = 'Mensaje a encriptar desde el servidor';
  console.log('publicKey con la que se encripta: ', serverKeyPair.publicKey)
  const encryptedMessage = serverKeyPair.publicKey.encrypt(bigintConversion.textToBigint(message))
  console.log('encryptedMessageByServer:', encryptedMessage)
  res.json({ encryptedMessage: encryptedMessage.toString() });
});


















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

  const publicKey = new rsa.RsaPubKey(
    65537n,
    28176885032699174226418500509424187840627679934540959280032971888481068601925936030861785597589090698670004473283283472607024066736412231264214431950503553910786820902946612151837809290690429588451447069835697807317171608960970778007815002289315309185668623550991882540698320286415498636888631595719703594410198404393178605842355607899384327635977872429668086141734924779297049508243182634378923048023513803129278849365457230356868178124515835528216571347576672194380893869849067003097196929617626179677951284614015240873995566344615016450664045227682458729711850461039068899738876799550600458075909897779592415160061n
  )
  const privKey = new rsa.RsaPrivKey(
    25480740167355070566289559351077008660186460762630338475829441566484871320959801712087135285818927466124120498552071017707980046984149523141201649815807004075204719893099072520725996084991058485880700398872125154469375964366402095448543020365267880955762952887271082146833493295309534190058160125607274565913832709682238453453132677752442358967522000122872780411555913595757102479006923014649146681371843426271883546576823044464798172814095884651097127503582232958783093238847904868036270257929807866490629465089051437467726013420141217168097677437378121390885787612649850446505233473504316186784984465110566917491769n,
    28176885032699174226418500509424187840627679934540959280032971888481068601925936030861785597589090698670004473283283472607024066736412231264214431950503553910786820902946612151837809290690429588451447069835697807317171608960970778007815002289315309185668623550991882540698320286415498636888631595719703594410198404393178605842355607899384327635977872429668086141734924779297049508243182634378923048023513803129278849365457230356868178124515835528216571347576672194380893869849067003097196929617626179677951284614015240873995566344615016450664045227682458729711850461039068899738876799550600458075909897779592415160061n
  )
  const msg = 'Mensaje a encriptar desde el servidor'
  // Encriptar el mensaje utilizando la clave pública
  // const encrypted = rsaKeys.publicKey.encrypt(bigintConversion.textToBigint(msg))
  const encrypted = publicKey.encrypt(bigintConversion.textToBigint(msg))
  // Desencriptar el mensaje encriptado utilizando la clave privada
  const decrypted = privKey.dencrypt(encrypted)
  const texdecrypted = bigintConversion.bigintToText(decrypted)

  // fimar con la llave privada y verificar con la publica
  const firma = privKey.sign(bigintConversion.textToBigint(msg))
  const verificado = publicKey.verify(firma)
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