import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  sendMessage(message: string) {
    return this.http.post(`${this.baseUrl}/messages`, { message });// el /messages indica el endpoint del post
  }
  getMessage(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/messages`);
  }
  sendPublicKey(message: string){
    return this.http.post(`${this.baseUrl}/pubkey`, { message });
  }
  sendPrivateKey(message: string){
    return this.http.post(`${this.baseUrl}/privkey`, { message });
  }


  /*getRSAKey(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rsa`);
  }*/

}
