// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';

interface UserCredentials {
  username: string;
  password: string;
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usando um signal para reatividade. O valor inicial é 'false' (não logado).
  private loggedIn = signal<boolean>(false);
  private sessionTimeout: any;
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 60 minutos em millisegundos

  // Credenciais padrão do sistema
  private defaultCredentials: UserCredentials = {
    username: 'admin',
    password: '1234',
    name: 'Administrador',
    email: 'admin@weg.com'
  };

  constructor() {
    // Para persistir o login entre reloads da página, podemos verificar o localStorage
    this.checkStoredSession();
    this.loadStoredCredentials();
  }

  private loadStoredCredentials(): void {
    const storedCredentials = localStorage.getItem('adminCredentials');
    if (storedCredentials) {
      try {
        this.defaultCredentials = JSON.parse(storedCredentials);
      } catch (error) {
        console.error('Erro ao carregar credenciais:', error);
      }
    }
  }

  private saveCredentials(): void {
    localStorage.setItem('adminCredentials', JSON.stringify(this.defaultCredentials));
  }

  private checkStoredSession(): void {
    const storedStatus = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');

    if (storedStatus === 'true' && loginTime) {
      const currentTime = new Date().getTime();
      const timeElapsed = currentTime - parseInt(loginTime);

      if (timeElapsed < this.SESSION_DURATION) {
        this.loggedIn.set(true);
        this.setSessionTimeout(this.SESSION_DURATION - timeElapsed);
      } else {
        // Sessão expirada
        this.clearSession();
      }
    }
  }

  private setSessionTimeout(duration: number): void {
    this.clearSessionTimeout();
    this.sessionTimeout = setTimeout(() => {
      this.expireSession();
    }, duration);
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  private expireSession(): void {
    console.log('Sessão expirada após 60 minutos');
    this.logout();
    // Aqui você pode adicionar uma notificação para o usuário
    alert('Sua sessão expirou. Você será redirecionado para a página de login.');
    window.location.href = '/login';
  }

  private clearSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    this.loggedIn.set(false);
    this.clearSessionTimeout();
  }

  // Método público para que componentes e guards possam verificar o status
  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  // Método que verifica se a sessão ainda é válida
  isSessionValid(): boolean {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;

    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - parseInt(loginTime);

    return timeElapsed < this.SESSION_DURATION;
  }

  // Método que retorna o tempo restante da sessão em minutos
  getSessionTimeRemaining(): number {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return 0;

    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - parseInt(loginTime);
    const timeRemaining = this.SESSION_DURATION - timeElapsed;

    return Math.max(0, Math.floor(timeRemaining / (60 * 1000))); // retorna em minutos
  }

  // Método que sua página de login chamaria
  login(user: string, pass: string): boolean {
    // Verifica com as credenciais atuais
    if (user === this.defaultCredentials.username && pass === this.defaultCredentials.password) {
      const currentTime = new Date().getTime();

      this.loggedIn.set(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', currentTime.toString());
      localStorage.setItem('currentUser', user);

      // Configurar timeout para expiração
      this.setSessionTimeout(this.SESSION_DURATION);

      console.log('Login realizado. Sessão expira em 60 minutos.');
      return true;
    }
    return false;
  }

  // Método que um botão de logout chamaria
  logout(): void {
    localStorage.removeItem('currentUser');
    this.clearSession();
    console.log('Logout realizado');
  }

  // Método para renovar a sessão (opcional)
  renewSession(): void {
    if (this.isLoggedIn()) {
      const currentTime = new Date().getTime();
      localStorage.setItem('loginTime', currentTime.toString());
      this.setSessionTimeout(this.SESSION_DURATION);
      console.log('Sessão renovada por mais 60 minutos');
    }
  }

  // Métodos para gerenciar perfil
  getCurrentUser(): UserCredentials {
    return { ...this.defaultCredentials };
  }

  updateProfile(newData: Partial<UserCredentials>): boolean {
    try {
      this.defaultCredentials = { ...this.defaultCredentials, ...newData };
      this.saveCredentials();
      console.log('Perfil atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }

  changePassword(currentPassword: string, newPassword: string): boolean {
    if (currentPassword === this.defaultCredentials.password) {
      this.defaultCredentials.password = newPassword;
      this.saveCredentials();
      console.log('Senha alterada com sucesso');
      return true;
    }
    return false;
  }

  getCurrentUsername(): string {
    return localStorage.getItem('currentUser') || this.defaultCredentials.username;
  }
}
