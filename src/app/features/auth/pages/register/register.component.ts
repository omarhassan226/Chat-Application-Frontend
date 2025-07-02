import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {


  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  imageFile: File | null = null;

  constructor(private authService: AuthService, private router:Router, private fb:FormBuilder){
    this.registerForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onfileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      console.log('Selected file:', this.imageFile);
      // You can also add the file to the form data if needed
      // this.registerForm.patchValue({ image: this.imageFile });
    } else {
      console.log('No file selected');
    }

  }

  register(){
    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.authService.register(formData).subscribe({
      next: (res:any) => {
        console.log('Registration successful', res);
        localStorage.setItem('token', res.token);
        this.isLoading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (error:any) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

}
