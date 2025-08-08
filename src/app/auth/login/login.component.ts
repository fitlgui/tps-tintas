import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/admin/admin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials = {
    username: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Se já estiver logado e sessão válida, redirecionar para admin
    if (this.authService.isLoggedIn() && this.authService.isSessionValid()) {
      this.router.navigate(['/admin']);
    } else if (this.authService.isLoggedIn() && !this.authService.isSessionValid()) {
      // Se logado mas sessão expirada, fazer logout
      this.authService.logout();
    }
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log('🔑 Iniciando processo de login...');
    
    // Chamar o método login que retorna Observable
    this.authService.login(this.credentials.username, this.credentials.password).subscribe({
      next: (success) => {
        console.log('📋 Resultado do login:', success);
        if (success) {
          console.log('✅ Login bem-sucedido, redirecionando...');
          this.router.navigate(['/admin']);
        } else {
          console.log('❌ Login falhado');
          this.errorMessage = 'Credenciais inválidas.';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('💥 Erro durante login:', error);
        this.errorMessage = 'Erro de conexão. Tente novamente.';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
