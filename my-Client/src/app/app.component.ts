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
    generateKeys(512).then((keys: RsaKeyPair) => {
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

  desencriptar(){
    console.log('dese onclcik')
  }

  firmar(){
    console.log('firma onclcik')
  }

  encriptar() {
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
  const mensajeEncriptado = rsaPubKey.encrypt(bigintconversion.textToBigint(mensaje));
  console.log('este es el mensajeEncriptado: ', mensajeEncriptado)
    // Crear el objeto JSON con el mensaje encriptado
    const mensajeEncriptadoJson = {
      mensajeEncriptado: mensajeEncriptado.toString()
    };

    // Convertir el objeto JSON a cadena
    const mensajeEncriptadoJsonString = JSON.stringify(mensajeEncriptadoJson);

    // Guardar el mensaje encriptado en localStorage
    localStorage.setItem('mensajeEncriptado', mensajeEncriptadoJsonString);
    console.log('el json mensajeEncriptadoJsonString: ', mensajeEncriptadoJsonString)
  }
  enviarMensajeEncriptado() {
    // Recuperar el mensaje encriptado del localStorage
    const mensajeEncriptadoJsonString = localStorage.getItem('mensajeEncriptado');

    if (mensajeEncriptadoJsonString === null) {
      console.error('No se encontró el mensaje encriptado en localStorage.');
      return;
    }

    // Enviar el mensaje encriptado al servidor utilizando el servicio DataService
    this.dataService.sendMessage(mensajeEncriptadoJsonString).subscribe(
      response => {
        console.log('Mensaje encriptado enviado al servidor:', response);
        // Realizar acciones adicionales después de enviar el mensaje encriptado
      },
      error => {
        console.error('Error al enviar el mensaje encriptado:', error);
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
