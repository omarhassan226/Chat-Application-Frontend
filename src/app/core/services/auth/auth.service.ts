import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { apiUrls } from '../../constant/api\'s';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(body:any) {
    return this.http.post(`${environment.apiUrl}${apiUrls.login}`, body);
  }

  register(body:any) {
    return this.http.post(`${environment.apiUrl}${apiUrls.register}`, body);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
