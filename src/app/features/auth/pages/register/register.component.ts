import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService } from 'angular-toastify';

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
    ])
  ],
})
export class RegisterComponent {


  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  imagePreview: any | null = null;
  imageFile: File | null = null;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private _toastService: ToastService) {
    this.registerForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      this.imageFile = file; // Store the selected file

      reader.onload = () => {
        this.imagePreview = reader.result;
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

    const formData = new FormData();
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
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
        }, 1500);
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

}
