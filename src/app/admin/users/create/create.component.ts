import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService, CreateUserData } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  userForm: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formData = this.userForm.value;
      
      const userData: CreateUserData = {
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        password: formData.password,
        role: formData.role
      };

      this.usersService.createUser(userData).subscribe({
        next: (response) => {
          alert('Usuário criado com sucesso!');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          alert('Erro ao criar usuário. Verifique os dados e tente novamente.');
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (control.errors['email']) {
        return 'Email deve ter um formato válido';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${minLength} caracteres`;
      }
      if (control.errors['min']) {
        return 'Idade deve ser maior que 0';
      }
      if (control.errors['max']) {
        return 'Idade deve ser menor que 120';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.userForm.errors?.['passwordMismatch'] && control?.touched) {
      return 'As senhas não coincidem';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: {[key: string]: string} = {
      name: 'Nome',
      email: 'Email',
      age: 'Idade',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      role: 'Função'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
