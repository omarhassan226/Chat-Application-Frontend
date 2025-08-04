import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService } from 'angular-toastify';
import { CountryISO } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
  ],
})
export class RegisterComponent implements OnInit {

  theme: 'light' | 'dark' = 'light';
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  imagePreview: any | null = null;
  imageFile: File | null = null;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.Egypt, CountryISO.UnitedStates];
  showPassword = false;

  constructor(private renderer: Renderer2, private authService: AuthService, private router: Router, private fb: FormBuilder, private _toastService: ToastService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  ngOnInit(): void {
    this.theme = localStorage.getItem('theme') as any || 'light';
    this.applyTheme();
    console.log(this.imagePreview);
  }

  toggleTheme() {
    this.theme = (this.theme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', this.theme);
  }


  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Image preview:', this.imagePreview);

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      this.imageFile = file;

      reader.onload = () => {
        this.imagePreview = reader.result;
        console.log('Image preview:', this.imagePreview);

      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageFile = null;
  }

  register() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('phone', this.registerForm.get('phone')?.value || '');
    formData.append('email', this.registerForm.get('email')?.value);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.authService.register(formData).subscribe({
      next: (res: any) => {
        this._toastService.success('Operation Successful');
        console.log('Registration successful', res);
        localStorage.setItem('token', res.token);
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1000);
      },
      error: (error: any) => {
        this._toastService.error('Registration failed');
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
