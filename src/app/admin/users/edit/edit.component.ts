import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService, User, UpdateUserData } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  userForm: FormGroup;
  loading: boolean = true;
  saving: boolean = false;
  userId: number;
  showPassword: boolean = false;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      password: [''], // Opcional na edição
      confirmPassword: [''],
      role: ['user', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.userId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.usersService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          age: user.age,
          role: user.role
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.loading = false;
        
        let errorMessage = 'Erro desconhecido';
        if (error.status === 404) {
          errorMessage = `Usuário com ID ${this.userId} não foi encontrado`;
        } else if (error.status === 403) {
          errorMessage = 'Você não tem permissão para acessar este usuário';
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar com o servidor. Verifique se a API está rodando';
        } else {
          errorMessage = `Erro ${error.status}: ${error.message || 'Falha ao carregar usuário'}`;
        }
        
        alert(errorMessage);
        this.router.navigate(['/admin/users']);
      }
    });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    // Se a senha foi preenchida, validar confirmação
    if (password && confirmPassword && password.value && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.saving = true;
      const formData = this.userForm.value;
      
      // Se não foi fornecida nova senha, usar a senha atual ou uma padrão
      const passwordToUse = formData.password && formData.password.trim() ? 
                           formData.password : 
                           (this.currentUser?.password || '1234');
      
      const userData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        password: passwordToUse,
        role: formData.role
      };

      console.log('Enviando dados para API:', { ...userData, password: '***' }); // Log sem mostrar senha

      this.usersService.editUser(this.userId, userData).subscribe({
        next: (response) => {
          alert('Usuário atualizado com sucesso!');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          alert('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
          this.saving = false;
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
