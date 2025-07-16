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

    // Simular delay de API
    setTimeout(() => {
      const success = this.authService.login(this.credentials.username, this.credentials.password);

      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = 'Credenciais inválidas.';
      }

      this.loading = false;
    }, 1000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
