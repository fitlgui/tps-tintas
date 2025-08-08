# Exemplo de Uso do AuthService Atualizado

## Como usar o novo AuthService com integração da API

### 1. No componente de Login:

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Usar o novo método login que retorna Observable
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          console.log('Login realizado com sucesso!');
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Credenciais inválidas ou usuário não é administrador';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro no login:', error);
        this.errorMessage = 'Erro ao conectar com o servidor';
      }
    });
  }
}
```

### 2. No Guard de Autenticação:

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/services/admin/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Verificar se está logado E se é admin
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

### 3. Para exibir informações do usuário:

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-admin-header',
  template: `
    <div class="user-info" *ngIf="userInfo">
      <span>Olá, {{ userInfo.name }}</span>
      <span class="age">{{ userInfo.age }} anos</span>
      <span class="role">{{ userInfo.role }}</span>
      <button (click)="logout()">Sair</button>
    </div>
  `
})
export class AdminHeaderComponent implements OnInit {
  userInfo: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUserInfo();
  }

  logout(): void {
    this.authService.logout();
    // Redirecionar será feito automaticamente
  }
}
```

### 4. Para listar administradores:

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html'
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.authService.getAdminUsers().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar administradores:', error);
        this.loading = false;
      }
    });
  }
}
```

## Principais Mudanças:

### ✅ **Integração com API:**
- Busca usuários em `/users` endpoint
- Valida credenciais na base de dados real
- Verifica role 'admin' obrigatoriamente

### ✅ **Segurança Aprimorada:**
- Apenas usuários com `role: 'admin'` podem fazer login
- Dados do usuário armazenados localmente de forma segura
- Fallback para credenciais padrão apenas em desenvolvimento

### ✅ **Métodos Novos:**
- `isAdmin()` - Verifica se usuário é administrador
- `getCurrentApiUser()` - Retorna dados completos do usuário da API
- `getCurrentUserInfo()` - Informações básicas do usuário
- `getAdminUsers()` - Lista todos os administradores

### ✅ **Compatibilidade:**
- Mantém métodos existentes para não quebrar código atual
- Login agora retorna Observable para melhor controle de estado
- Sessão persiste com dados completos do usuário

## Estrutura Esperada da API `/users`:

```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@empresa.com",
      "age": 35,
      "password": "senha123",
      "role": "admin",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@empresa.com",
      "age": 28,
      "password": "senha456",
      "role": "admin",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## Implementação no Login Component (HTML):

```html
<form (ngSubmit)="onLogin()">
  <div class="form-group">
    <label>Nome ou Email:</label>
    <input 
      type="text" 
      [(ngModel)]="username" 
      placeholder="Digite seu nome ou email"
      required>
  </div>
  
  <div class="form-group">
    <label>Senha:</label>
    <input 
      type="password" 
      [(ngModel)]="password" 
      placeholder="Digite sua senha"
      required>
  </div>
  
  <div class="error-message" *ngIf="errorMessage">
    {{ errorMessage }}
  </div>
  
  <button type="submit" [disabled]="loading">
    <span *ngIf="loading">Entrando...</span>
    <span *ngIf="!loading">Entrar</span>
  </button>
</form>
```

### ✅ **Principais Mudanças da Nova Interface:**

| Campo Antigo | Campo Novo | Observação |
|--------------|------------|------------|
| `username` | *(removido)* | Login agora usa `name` ou `email` |
| *(novo)* | `age` | Idade do usuário adicionada |
| `name` | `name` | Mantido |
| `email` | `email` | Mantido |
| `password` | `password` | Mantido |
| `role` | `role` | Mantido |

### ✅ **Validação de Login Atualizada:**
- **Campo de login**: Aceita `name` ou `email` (não há mais `username`)
- **Verificação de admin**: Mantém validação `role === 'admin'`
- **Dados completos**: Inclui campo `age` nas informações do usuário
