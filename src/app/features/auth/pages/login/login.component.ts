import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
})
export class LoginComponent {

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private toastService: ToastService) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.toastService.success('Login successful');
        console.log('Login successful', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('userData', JSON.stringify(res.user));
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/chat']);
        }, 1500);
      },
      error: (error: any) => {
        this.toastService.error('Login failed');
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

