// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, timeout } from 'rxjs';
import { environment } from 'src/environment/enviroment';

interface UserCredentials {
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  age: number;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usando um signal para reatividade. O valor inicial é 'false' (não logado).
  private loggedIn = signal<boolean>(false);
  private sessionTimeout: any;
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 60 minutos em millisegundos
  private currentUser: ApiUser | null = null;

  // API URL base
  private readonly apiUrl = environment.apiUrl;

  // Credenciais padrão do sistema (fallback)
  private defaultCredentials: UserCredentials = {
    username: 'adm_tpstintas',
    password: 'adm@tpstintas',
    name: 'Admin TPS',
    role: 'admin',
    email: 'admin@weg.com'
  };

  constructor(private http: HttpClient) {
    // Para persistir o login entre reloads da página, podemos verificar o localStorage
    this.checkStoredSession();
    this.loadStoredCredentials();
    
    // Expor o serviço globalmente para debug
    (window as any).authService = this;
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
    const storedUser = localStorage.getItem('currentUserData');

    if (storedStatus === 'true' && loginTime && storedUser) {
      const currentTime = new Date().getTime();
      const timeElapsed = currentTime - parseInt(loginTime);

      if (timeElapsed < this.SESSION_DURATION) {
        try {
          this.currentUser = JSON.parse(storedUser);
          this.loggedIn.set(true);
          this.setSessionTimeout(this.SESSION_DURATION - timeElapsed);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          this.clearSession();
        }
      } else {
        // Sessão expirada
        this.clearSession();
      }
    }
  }

  // Método para buscar todos os usuários da API
  private getUsers(): Observable<ApiUser[]> {
    
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      timeout(3000), // 30 segundos de timeout
      map((response) => {
        
        // Verificar diferentes estruturas de resposta
        let users: ApiUser[] = [];
        
        if (Array.isArray(response)) {
          // Se a resposta é um array direto
          users = response;
        } else if (response.users && Array.isArray(response.users)) {
          // Se tem propriedade 'users'
          users = response.users;
        } else if (response.items && Array.isArray(response.items)) {
          // Se tem propriedade 'items' (paginação)
          users = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          // Se tem propriedade 'data'
          users = response.data;
        } else {
          console.error('Estrutura de resposta não reconhecida:', response);
          return [];
        }
        
        return users;
      }),
      catchError((error) => {
        
        if (error.status === 0) {
          console.error('❌ Erro de CORS ou rede - API inacessível');
        } else if (error.status === 404) {
          console.error('❌ Endpoint /users não encontrado');
        } else if (error.status >= 500) {
          console.error('❌ Erro interno do servidor');
        }
        
        return of([]);
      })
    );
  }

  // Método para validar credenciais na API
  private validateUserCredentials(username: string, password: string): Observable<ApiUser | null> {
    
    return this.getUsers().pipe(
      map((users: ApiUser[]) => {
        
        // Verificar se users é um array
        if (!Array.isArray(users)) {
          return null;
        }

        const user = users.find(u => {
          const nameMatch = u.name?.toLowerCase() === username.toLowerCase();
          const emailMatch = u.email?.toLowerCase() === username.toLowerCase();
          const isAdmin = u.role === 'admin' || u.role === 'user';
          const passwordMatch = u.password === password;
          
          return (nameMatch || emailMatch) && isAdmin;
        });

        if (user) {
          if (user.password === password) {
            return user;
          } else {
            console.warn('Senha ou usuário incorretos');
            return null;
          }
        } else {
          // Usuário não encontrado ou não é admin
        }

        return null;
      }),
      catchError((error) => {
        console.error('Erro na validação de credenciais:', error);
        return of(null);
      })
    );
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
    this.logout();
    // Aqui você pode adicionar uma notificação para o usuário
    alert('Sua sessão expirou. Você será redirecionado para a página de login.');
    window.location.href = '/login';
  }

  private clearSession(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('currentUserData');
    localStorage.removeItem('currentUser');
    this.currentUser = null;
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

    return Math.max(0, Math.floor(timeRemaining / (60 * 100))); // retorna em minutos
  }

  // Método que sua página de login chamaria - agora retorna Observable
  login(user: string, pass: string): Observable<boolean> {
    return this.validateUserCredentials(user, pass).pipe(
      map((apiUser: ApiUser | null) => {
        if (apiUser) {
          const currentTime = new Date().getTime();

          this.currentUser = apiUser;
          this.loggedIn.set(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loginTime', currentTime.toString());
          localStorage.setItem('currentUser', apiUser.name || apiUser.email);
          localStorage.setItem('currentUserData', JSON.stringify(apiUser));

          // Configurar timeout para expiração
          this.setSessionTimeout(this.SESSION_DURATION);

          return true;
        } else {
          // Fallback para credenciais padrão (apenas em desenvolvimento)
          if (user === this.defaultCredentials.username && pass === this.defaultCredentials.password) {
            const currentTime = new Date().getTime();

            this.loggedIn.set(true);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', currentTime.toString());
            localStorage.setItem('currentUser', user);

            // Configurar timeout para expiração
            this.setSessionTimeout(this.SESSION_DURATION);

            return true;
          }
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ Erro durante o login:', error);
        return of(false);
      })
    );
  }

  // Método sincronizado para compatibilidade (deprecated)
  loginSync(user: string, pass: string): boolean {
    // Verifica com as credenciais padrão apenas
    if (user === this.defaultCredentials.username && pass === this.defaultCredentials.password) {
      const currentTime = new Date().getTime();

      this.loggedIn.set(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', currentTime.toString());
      localStorage.setItem('currentUser', user);

      // Configurar timeout para expiração
      this.setSessionTimeout(this.SESSION_DURATION);
      return true;
    }
    return false;
  }

  // Método que um botão de logout chamaria
  logout(): void {
    localStorage.removeItem('currentUser');
    this.clearSession();
  }

  // Método para renovar a sessão (opcional)
  renewSession(): void {
    if (this.isLoggedIn()) {
      const currentTime = new Date().getTime();
      localStorage.setItem('loginTime', currentTime.toString());
      this.setSessionTimeout(this.SESSION_DURATION);
    }
  }

  // Métodos para gerenciar perfil
  getCurrentUser(): UserCredentials {
    if (this.currentUser) {
      return {
        username: this.currentUser.name, // Usar name como username já que não tem username na API
        password: '***', // Não expor senha
        name: this.currentUser.name,
        email: this.currentUser.email
      };
    }
    return { ...this.defaultCredentials };
  }

  getCurrentApiUser(): ApiUser | null {
    return this.currentUser;
  }

  // Método para verificar se usuário é admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'user' || this.isLoggedIn();
  }

  // Método para verificar se usuário pode editar (apenas admin)
  canEdit(): boolean {
    // Se não há usuário atual mas está logado, pode ser fallback para credenciais padrão (admin)
    if (!this.currentUser && this.isLoggedIn()) {
      return true; // Fallback para credenciais padrão
    }
    return this.currentUser?.role === 'admin';
  }

  // Método para verificar se usuário pode apenas visualizar
  canView(): boolean {
    return this.isLoggedIn() && (this.currentUser?.role === 'admin' || this.currentUser?.role === 'user');
  }

  // Método para obter informações do usuário atual
  getCurrentUserInfo(): { name: string; email: string; role: string; age: number } | null {
    if (this.currentUser) {
      return {
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role,
        age: this.currentUser.age
      };
    }
    return null;
  }

  

  getCurrentUsername(): string {
    if (this.currentUser) {
      return this.currentUser.name || this.currentUser.email;
    }
    return localStorage.getItem('currentUser') || this.defaultCredentials.name || 'Usuário';
  }

  // Método para listar todos os administradores
  getAdminUsers(): Observable<ApiUser[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.role === 'admin'))
    );
  }

  // Método público para debug - listar todos os usuários
  getAllUsersForDebug(): Observable<ApiUser[]> {
    return this.getUsers();
  }

  // Método público para testar conexão com API
  testApiConnection(): Observable<boolean> {
    
    return this.http.get(`${this.apiUrl}/users`).pipe(
      timeout(30000), // 30 segundos de timeout
      map((response) => {
        return true;
      }),
      catchError((error) => {
        console.error('❌ Teste de API falhou:', error);
        return of(false);
      })
    );
  }

  // Método de debug para ser chamado manualmente
  debugApiCall(): void {
    this.testApiConnection().subscribe({
      next: (success) => {
        if (success) {
          this.getAllUsersForDebug().subscribe({
            next: (users) => {
              const adminUsers = users.filter(u => u.role === 'admin');
            },
            error: (err) => console.error('❌ Erro no getUsers:', err)
          });
        } else {
          console.error('💥 API não está acessível');
        }
      },
      error: (err) => console.error('💥 Erro no teste:', err)
    });
  }
}
