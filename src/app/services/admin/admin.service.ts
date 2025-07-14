// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usando um signal para reatividade. O valor inicial é 'false' (não logado).
  private loggedIn = signal<boolean>(false);

  // Método público para que componentes e guards possam verificar o status
  isLoggedIn = this.loggedIn.asReadonly(); // .asReadonly() impede a alteração externa

  constructor() {
    // Para persistir o login entre reloads da página, podemos verificar o localStorage
    const storedStatus = localStorage.getItem('isLoggedIn');
    if (storedStatus === 'true') {
      this.loggedIn.set(true);
    }
  }

  // Método que sua página de login chamaria
  login(user: string, pass: string): boolean {
    // Lógica de login real iria aqui (verificar com uma API, etc.)
    // Por enquanto, vamos apenas simular um login de sucesso
    if (user === 'admin' && pass === '1234') {
      this.loggedIn.set(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  }

  // Método que um botão de logout chamaria
  logout(): void {
    this.loggedIn.set(false);
    localStorage.removeItem('isLoggedIn');
  }
}
