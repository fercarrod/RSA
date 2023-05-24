import { Component } from '@angular/core';
import { DataService } from './data.service';
import { RsaKeyPair, generateKeys,RsaPubKey, RsaPrivKey } from './utils/rsa';
import * as bcu from 'bigint-crypto-utils';
import * as bigintconversion from 'bigint-conversion'
import * as fs from 'fs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-Client';
  receivedMessage: string='';
  messagetoEncrypt: string = '';
  mensaje: string= '';

  constructor(private dataService: DataService) { }





  // Funciones de prueba para enviar recibir y almacenar un mensaje
  //
  almacenarMensaje() {
    console.log('Mensaje almacenado:', this.mensaje);
  }
  sendMessage() {
    const message = 'Que pasa cabesa!';

    this.dataService.sendMessage(message).subscribe(
      response => {
        console.log('Message sent successfully:', response);
        // Handle response...
      },
      error => {
        console.error('Failed to send message:', error);
        // Handle error...
      }
    );
  }
  getMessage() {
    this.dataService.getMessage().subscribe(
      response => {
        console.log('Message received:', response);
        this.receivedMessage = response.message;
      },
      error => {
        console.error('Failed to get message:', error);
        // Handle error...
      }
    );
  }






  // Función que genera las llaves privada y pública del Cliente
  //
  generateKeys() {
    generateKeys(1024).then((keys: RsaKeyPair) => {
      console.log('Claves generadas:', keys);

      const publicKey = {
        e: keys.publicKey.e.toString(),
        n: keys.publicKey.n.toString()
      };
      const publicKeyJson = JSON.stringify(publicKey);
      localStorage.setItem('publicKey', publicKeyJson);
      console.log('La clave pública se ha guardado en el Local Storage con clave "publicKey"');

      const privateKey = {
        d: keys.privateKey.d.toString(),
        n: keys.privateKey.n.toString()
      };
      const privateKeyJson = JSON.stringify(privateKey);
      localStorage.setItem('privateKey', privateKeyJson);
      console.log('La clave privada se ha guardado en el Local Storage con clave "privateKey"');
    }).catch((error: any) => {
      console.error('Error al generar las claves:', error);
    });
  }



  // función que envia la llave Pública y/o privada al Servidor, para que el servidor pueda desencriptar o verificar las firmas del Cliente
  //
  enviarLlavePublica() {
    console.log('hola on click enviar llave')
    // Recuperar la llave pública del localStorage
    const llavePublicaJsonString = localStorage.getItem('publicKey');
    console.log('pub recuperada: ', llavePublicaJsonString)

    if (llavePublicaJsonString === null) {
      console.error('No se encontró la llave pública en localStorage.');
      return;
    }
    // Enviar la llave pública al servidor utilizando el servicio DataService
    this.dataService.sendPublicKey(llavePublicaJsonString).subscribe(
      response => {
        console.log('Llave pública enviada al servidor:', response);
        // Realizar acciones adicionales después de enviar la llave pública
      },
      error => {
        console.error('Error al enviar la llave pública:', error);
      }
    );
  }
  enviarLlavePrivada() {
    // Recuperar la llave pública del localStorage
    const llavePrivateJsonString = localStorage.getItem('privateKey');
    console.log('llavePrivateJsonString: ',llavePrivateJsonString)

    if (llavePrivateJsonString === null) {
      console.error('No se encontró la llave pública en localStorage.');
      return;
    }

    // Enviar la llave pública al servidor utilizando el servicio DataService
    this.dataService.sendPrivateKey(llavePrivateJsonString).subscribe(
      response => {
        console.log('Llave pública enviada al servidor:', response);
        // Realizar acciones adicionales después de enviar la llave pública
      },
      error => {
        console.error('Error al enviar la llave pública:', error);
      }
    );
  }







  // Funciones que reciben la llave Privada y/o Pública del Servidor para poder desencriptar o verificar los mensajes que envia el Servidor
  //
  recibirLlavePublicaServidor() {
    this.dataService.recibirLlavePublicaServidor().subscribe(
      response => {
        console.log('Llave publica Servidor Recibida:', response);
        this.receivedMessage = response.message;
        //localStorage.setItem('publicKeyServer',this.receivedMessage)
        const { e, n } = response.publicKey;
        console.log('e: ',e)
        console.log('n: ',n)
        // Guardar los valores de d y n en el localStorage
        localStorage.setItem('publicKeye', e);
        localStorage.setItem('publicKeyn', n);
      },
      error => {
        console.error('Failed to get message:', error);
        // Handle error...
      }
    );
  }

  recibirLlavePrivadaServidor() {
    this.dataService.recibirLlavePrivadaServidor().subscribe(
      response => {
        console.log('Llave privada Servidor Recibida:', response);
        const { d, n } = response.privKey;
       // Guardar los valores de d y n en el localStorage
       localStorage.setItem('privateKeyD', d);
       localStorage.setItem('privateKeyN', n);
       console.log('Valores de d y n guardados en el cliente:',d, n);
       },
      error => {
        console.error('Failed to get message:', error);
        // Handle error...
      }
    );
  }
















  // Funciones donde el Cliente envia el mensaje al Servidor
  //                                             Firmado con la     llave privada del Cliente ---> Servidor verifica con la     llave pública del Cliente
  //                                             Encriptado con la  llave pública al Servidor ---> Servidor desencripta con la  llave privada del Cliente
  //
  //## Falta arreglar estas 2 de aqui
  enviarMensajeFirmado(){
    // Recuperar el mensaje almacenado
  const mensaje = this.mensaje;

  // Recuperar la llave pública desde localStorage
  const privateKeyJson = localStorage.getItem('privateKey');
  if (privateKeyJson === null) {
    // La llave pública no está almacenada en localStorage
    console.error('No se encontró la llave pública en localStorage.');
    return;
  }
  const privateKey = JSON.parse(privateKeyJson);
  // Obtener los valores de 'd' y 'n' del objeto privateKey
  const d = BigInt(privateKey.d);
  const n = BigInt(privateKey.n);
  // Crear una instancia de RsaPubKey utilizando 'e' y 'n'
  const rsaPrivKey = new RsaPrivKey(d, n);
  console.log('rsaPrivKey con la que se firma: ',rsaPrivKey)
  // Encriptar el mensaje utilizando la instancia de RsaPubKey y el bigintcoversion para poder encriptar textos, convertir text to bigint, sino solo se puede encriptar números
  console.log('el mensaje a firmar es: ', mensaje)
  const mensajeFirmado = rsaPrivKey.sign(bigintconversion.textToBigint(mensaje));
  console.log('este es el mensajeEncriptado: ', mensajeFirmado)
    // Crear el objeto JSON con el mensaje encriptado
    const mensajeFirmadoJson = {
      mensajeFirmado: mensajeFirmado.toString()
    };
    // Convertir el objeto JSON a cadena
    const mensajeEncriptadoJsonString = JSON.stringify(mensajeFirmadoJson);
    console.log('mensajeEncriptadoJsonString que se a firmado:',mensajeEncriptadoJsonString)
    if (mensajeEncriptadoJsonString === null) {
      console.error('No se encontró el mensaje encriptado en localStorage.');
      return;
    }
    this.dataService.enviarMensajeFirmado(mensajeEncriptadoJsonString).subscribe(
      response => {
        console.log('Mensaje encriptado enviado al servidor:', response);
      },
      error => {
        console.error('Error al enviar el mensaje encriptado:', error);
      }
    )
  }
  enviarMensajeEncriptado() {
  // Recuperar el mensaje almacenado
  const mensaje = this.mensaje;

  // Recuperar la llave pública desde localStorage
  const publicKeyJson = localStorage.getItem('publicKey');

  if (publicKeyJson === null) {
    // La llave pública no está almacenada en localStorage
    console.error('No se encontró la llave pública en localStorage.');
    return;
  }

  const publicKey = JSON.parse(publicKeyJson);
  console.log('publicKey recuperada: ',publicKey)
  // Obtener los valores de 'e' y 'n' del objeto publicKey
  const eString = publicKey.e;
  const nString = publicKey.n;
  console.log('nString: ',eString)
  console.log('nString: ',nString)
  if (eString === null || nString === null) {
    console.error('Private key values are not found in localStorage.');
    return;
  }

  const d = BigInt(eString);
  const n = BigInt(nString);
  console.log('d: ',d)
  console.log('n: ',n)

  // Crear una instancia de RsaPubKey utilizando 'e' y 'n'
  const rsaPubKey = new RsaPubKey(d,n);
  console.log('rsaPubKey con la que se firma: ',rsaPubKey)
  // Encriptar el mensaje utilizando la instancia de RsaPubKey y el bigintcoversion para poder encriptar textos, convertir text to bigint, sino solo se puede encriptar números
  console.log('el mensaje a encriptar es: ', mensaje)
  const mensajeEncriptado = rsaPubKey.encrypt(bigintconversion.textToBigint(mensaje));
  console.log('este es el mensajeEncriptado: ', mensajeEncriptado)
    // Crear el objeto JSON con el mensaje encriptado
    const mensajeEncriptadoJson = {
      mensajeEncriptado: mensajeEncriptado.toString()
    };
    // Convertir el objeto JSON a cadena
    const mensajeEncriptadoJsonString = JSON.stringify(mensajeEncriptadoJson);
    console.log('mensajeEncriptadoJsonString:',mensajeEncriptadoJsonString)
    if (mensajeEncriptadoJsonString === null) {
      console.error('No se encontró el mensaje encriptado en localStorage.');
      return;
    }
    this.dataService.enviarMensajeEncriptado(mensajeEncriptadoJsonString).subscribe(
      response => {
        console.log('Mensaje encriptado enviado al servidor:', response);
      },
      error => {
        console.error('Error al enviar el mensaje encriptado:', error);
      }
    )
  }











  // Funciones que reciben mensajes del Servidor
  //                                            Encriptado con la llave   pública del Servidor  ---> Desencriptar con la   Privada del Servidorç
  //                                            Firmado con la    llave   privada del Servidor  ---> Verificar con la      Pública del Servidor
  //
  //
  recibirMensajeEncriptado() {// desencripta mal salen cosas raras
    this.dataService.recibirMensajeEncriptado().subscribe(
      response => {

        console.log('El mensaje recibido es:', response);
        const messageEncryptedbyServer = response;
        // console.log('El messageEncryptedbyServer es:', messageEncryptedbyServer);
        const jsonstring = JSON.stringify(response)
        // console.log('jsonstring: ',jsonstring)
        const jsonObject = JSON.parse(jsonstring);
        const encryptedMessage = jsonObject.encryptedMessage;
        console.log('encryptedMessage: ',encryptedMessage)

        // Recuperar la llave privada desde localStorage
        const dString = localStorage.getItem('privateKeyD');
        const nString = localStorage.getItem('privateKeyN');
        // console.log('d:', dString);
        // console.log('n:', nString);

        if (dString === null || nString === null) {
          console.error('Private key values are not found in localStorage.');
          return;
        }

        const d = BigInt(dString);
        const n = BigInt(nString);
        // console.log('d:', d);
        // console.log('n:', n);

        if (d === null || n === null ) {
         // La llave pública no está almacenada en localStorage
        console.error('No se encontró la llave pública en localStorage.');
        return;
        }
        // Crear una instancia de RsaPrivKey utilizando 'd' y 'n'
        const privKeyS = new RsaPrivKey(
          d,
          n
        )
        console.log('rsaPrivKey:', privKeyS )

        const encryptedMessageBigInt =BigInt(encryptedMessage)
        console.log('bigint: ',encryptedMessageBigInt)
        const messagedecrypted = privKeyS.decrypt(encryptedMessageBigInt);
        console.log('messagedecrypted:', messagedecrypted);

        const messagedecryptedtoText = bigintconversion.bigintToText(messagedecrypted);
        console.log('messagedecryptedtoText:', messagedecryptedtoText);
        },
        error => {
        console.error('Failed to get message:', error);
        // Handle error...
        }
    );
  }

  recibirMensajeFirmado(){// Firmado con la    llave   privada del Servidor  ---> Verificar con la      Pública del Servidor
    console.log('verificar onclcik')
    this.dataService.recibirMensajeFirmado().subscribe(
      response => {

        console.log('El mensajeFirmado recibido es:', response);
        const mensajeFirmado = response;
        // console.log('El messageEncryptedbyServer es:', messageEncryptedbyServer);
        const jsonstring = JSON.stringify(response)
        // console.log('jsonstring: ',jsonstring)
        const jsonObject = JSON.parse(jsonstring);
        const encryptedSignMessage = jsonObject.mensajeFirmado;
        console.log('encryptedSignMessage: ',encryptedSignMessage)

        // Recuperar la llave privada desde localStorage
        const eString = localStorage.getItem('publicKeye');
        const nString = localStorage.getItem('publicKeyn');
        // console.log('d:', dString);
        // console.log('n:', nString);

        if (eString === null || nString === null) {
          console.error('publicKeyServer  values are not found in localStorage.');
          return;
        }

        const e = BigInt(eString);
        const n = BigInt(nString);
        // console.log('d:', d);
        // console.log('n:', n);

        if (e === null || n === null ) {
         // La llave pública no está almacenada en localStorage
        console.error('No se encontró la llave pública en localStorage.');
        return;
        }
        // Crear una instancia de RsaPrivKey utilizando 'd' y 'n'
        const publicKeyS = new RsaPubKey(
          e,
          n
        )
        console.log('publicKeyS:', publicKeyS )

        const encryptedSignMessageBigInt =BigInt(encryptedSignMessage)
        console.log('Sign to bigint: ',encryptedSignMessageBigInt)
        const messageVerified= publicKeyS.verify(encryptedSignMessageBigInt);
        console.log('encryptedSignMessageBigInt:', messageVerified);

        const messageVerifiedtoText = bigintconversion.bigintToText(messageVerified);
        console.log('messageVerifiedtoText:', messageVerifiedtoText);
        },
        error => {
        console.error('Failed to get message:', error);
        // Handle error...
        }
    );
  }
  desencriptar(){
    console.log('dese onclcik')
  }

}
/*ejemplo esqueleto funcion
  function()  {// el nombre de esta funcion tiene que estar en el .html cuando aprietas el boton por ejemplo.
                  y tmb tiene que estar en el data.service.ts que es el encargado en comunicarse con el Servidor

    this.dataService.function().subscribe(
      response => {
        // Handle response...
      },
      error =>
        // Handle error...
      }
    );
  } */
