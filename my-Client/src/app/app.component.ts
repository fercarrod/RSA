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
  recibirLlavePublicaServidor() {
    this.dataService.recibirLlavePublicaServidor().subscribe(
      response => {
        console.log('Llave publica Servidor Recibida:', response);
        this.receivedMessage = response.message;
        localStorage.setItem('publicKeyServer',this.receivedMessage)
      },
      error => {
        console.error('Failed to get message:', error);
        // Handle error...
      }
    );
  }
  enviarLlavePrivada() {
    // Recuperar la llave pública del localStorage
    const llavePublicaJsonString = localStorage.getItem('privateKey');

    if (llavePublicaJsonString === null) {
      console.error('No se encontró la llave pública en localStorage.');
      return;
    }

    // Enviar la llave pública al servidor utilizando el servicio DataService
    this.dataService.sendPrivateKey(llavePublicaJsonString).subscribe(
      response => {
        console.log('Llave pública enviada al servidor:', response);
        // Realizar acciones adicionales después de enviar la llave pública
      },
      error => {
        console.error('Error al enviar la llave pública:', error);
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

  desencriptar(){
    console.log('dese onclcik')
  }

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
  const d = privateKey.d;
  const n = privateKey.n;
  // Crear una instancia de RsaPubKey utilizando 'e' y 'n'
  const rsaPrivKey = new RsaPrivKey(bigintconversion.textToBigint(d), bigintconversion.textToBigint(n));
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
  // Obtener los valores de 'e' y 'n' del objeto publicKey
  const e = publicKey.e;
  const n = publicKey.n;

  // Crear una instancia de RsaPubKey utilizando 'e' y 'n'
  const rsaPubKey = new RsaPubKey(BigInt(e), BigInt(n));

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

  verificar(){
    console.log('verificar onclcik')
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
