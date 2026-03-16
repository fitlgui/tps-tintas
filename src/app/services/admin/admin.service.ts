import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, timeout } from 'rxjs';
import { environment } from 'src/environment/enviroment';
import { NotificationService } from '../ui/notification.service';

interface UserCredentials {
  username: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  access_token: string;
  user: ApiUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loggedIn = signal<boolean>(false);
  private sessionTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 60 minutos em milissegundos
  private currentUser: ApiUser | null = null;

  private readonly apiUrl = environment.apiUrl;

  private readonly STORAGE_KEYS = {
    token: 'authToken',
    loginTime: 'loginTime',
    currentUser: 'currentUser',
    currentUserData: 'currentUserData'
  } as const;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {
    this.checkStoredSession();
  }

  private checkStoredSession(): void {
    const token = sessionStorage.getItem(this.STORAGE_KEYS.token);
    const loginTime = sessionStorage.getItem(this.STORAGE_KEYS.loginTime);
    const storedUser = sessionStorage.getItem(this.STORAGE_KEYS.currentUserData);

    if (!token || !loginTime || !storedUser) {
      this.clearSession();
      return;
    }

    const currentTime = Date.now();
    const timeElapsed = currentTime - Number(loginTime);

    if (timeElapsed >= this.SESSION_DURATION) {
      this.clearSession();
      return;
    }

    try {
      this.currentUser = JSON.parse(storedUser) as ApiUser;
      this.loggedIn.set(true);
      this.setSessionTimeout(this.SESSION_DURATION - timeElapsed);
    } catch (error) {
      console.error('Erro ao carregar dados da sessao:', error);
      this.clearSession();
    }
  }

  private setSessionTimeout(duration: number): void {
    this.clearSessionTimeout();

    if (duration <= 0) {
      this.expireSession();
      return;
    }

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
    this.clearSession();
    void this.notificationService.warning('Sua sessão expirou. Faça login novamente.', 'Sessão expirada');
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.STORAGE_KEYS.token);
    sessionStorage.removeItem(this.STORAGE_KEYS.loginTime);
    sessionStorage.removeItem(this.STORAGE_KEYS.currentUserData);
    sessionStorage.removeItem(this.STORAGE_KEYS.currentUser);

    this.currentUser = null;
    this.loggedIn.set(false);
    this.clearSessionTimeout();
  }

  private storeSession(loginResponse: LoginResponse): void {
    const currentTime = Date.now();

    this.currentUser = loginResponse.user;
    this.loggedIn.set(true);

    sessionStorage.setItem(this.STORAGE_KEYS.token, loginResponse.access_token);
    sessionStorage.setItem(this.STORAGE_KEYS.loginTime, currentTime.toString());
    sessionStorage.setItem(this.STORAGE_KEYS.currentUser, loginResponse.user.name || loginResponse.user.email);
    sessionStorage.setItem(this.STORAGE_KEYS.currentUserData, JSON.stringify(loginResponse.user));

    this.setSessionTimeout(this.SESSION_DURATION);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.STORAGE_KEYS.token);
  }

  handleUnauthorized(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn() && Boolean(this.getAccessToken());
  }

  isSessionValid(): boolean {
    const token = this.getAccessToken();
    const loginTime = sessionStorage.getItem(this.STORAGE_KEYS.loginTime);

    if (!token || !loginTime) {
      return false;
    }

    const currentTime = Date.now();
    const timeElapsed = currentTime - Number(loginTime);

    return timeElapsed < this.SESSION_DURATION;
  }

  getSessionTimeRemaining(): number {
    const loginTime = sessionStorage.getItem(this.STORAGE_KEYS.loginTime);

    if (!loginTime) {
      return 0;
    }

    const timeElapsed = Date.now() - Number(loginTime);
    const timeRemaining = this.SESSION_DURATION - timeElapsed;

    return Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
  }

  login(email: string, password: string): Observable<boolean> {
    const payload = {
      email: email.trim().toLowerCase(),
      password
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      timeout(10000),
      tap((response) => this.storeSession(response)),
      map(() => true),
      catchError((error) => {
        console.error('Erro durante login:', error);
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  renewSession(): void {
    if (this.isLoggedIn()) {
      sessionStorage.setItem(this.STORAGE_KEYS.loginTime, Date.now().toString());
      this.setSessionTimeout(this.SESSION_DURATION);
    }
  }

  getCurrentUser(): UserCredentials {
    if (this.currentUser) {
      return {
        username: this.currentUser.email,
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role
      };
    }

    return {
      username: 'Usuario'
    };
  }

  getCurrentApiUser(): ApiUser | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canEdit(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canView(): boolean {
    const role = this.currentUser?.role;
    return this.isLoggedIn() && (role === 'admin' || role === 'user' || role === 'moderator');
  }

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

    return sessionStorage.getItem(this.STORAGE_KEYS.currentUser) || 'Usuario';
  }

  getAdminUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${this.apiUrl}/users`).pipe(
      map((users) => users.filter((user) => user.role === 'admin')),
      catchError((error) => {
        console.error('Erro ao buscar administradores:', error);
        return of([]);
      })
    );
  }

  getAllUsersForDebug(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${this.apiUrl}/users`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar usuarios:', error);
        return of([]);
      })
    );
  }

  testApiConnection(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      timeout(10000),
      map(() => true),
      catchError(() => of(false))
    );
  }
}
