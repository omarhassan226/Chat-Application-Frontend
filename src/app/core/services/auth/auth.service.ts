import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { apiUrls } from '../../constant/api\'s';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  tokenKey:any = 'token'

  login(body:any) {
    return this.http.post(`${environment.apiUrl}${apiUrls.login}`, body);
  }

  register(body:any) {
    return this.http.post(`${environment.apiUrl}${apiUrls.register}`, body);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    // this.isLogin.next(false);
    // this.user.next(null);
    this.router.navigate(['/auth/login'])
  }


    isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }
}
