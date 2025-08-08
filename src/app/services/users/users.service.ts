import { Injectable } from '@angular/core';
import { AuthService } from '../admin/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/enviroment';
import { map, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  password?: string; // Opcional pois pode não vir da API por segurança
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
  // Campos alternativos da API
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  age: number;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserData {
  name: string;
  email: string;
  age: number;
  password: string; // Obrigatório na API
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  constructor(private readonly adminService: AuthService, private readonly http: HttpClient) { }

  private checkAdminAccess(): void {
    // Primeiro verifica se está logado
    if (!this.adminService.isLoggedIn()) {
      throw new Error('Acesso negado: você precisa estar logado');
    }

    const userInfo = this.adminService.getCurrentUserInfo();
    
    // Se não há userInfo mas está logado, pode ser fallback para credenciais padrão (admin)
    if (!userInfo) {
      console.log('✅ Acesso admin liberado - usuário logado sem userInfo (fallback admin)');
      return;
    }
    
    const userRole = userInfo.role;
    if (userRole !== 'admin') {
      throw new Error('Acesso negado: apenas administradores podem gerenciar usuários');
    }
  }

  private checkViewAccess(): void {
    // Primeiro verifica se está logado
    if (!this.adminService.isLoggedIn()) {
      throw new Error('Acesso negado: você precisa estar logado para visualizar usuários');
    }

    // Debug: verificar informações do usuário
    const userInfo = this.adminService.getCurrentUserInfo();
    console.log('🔍 Verificando acesso - UserInfo:', userInfo);
    
    // Se não há userInfo mas está logado, pode ser fallback para credenciais padrão (admin)
    if (!userInfo) {
      console.log('✅ Acesso liberado - usuário logado sem userInfo (fallback admin)');
      return;
    }
    
    const userRole = userInfo.role;
    console.log('🔍 Verificando acesso - Role:', userRole);
    
    // Permite acesso para admin e user
    if (userRole !== 'admin' && userRole !== 'user') {
      console.warn('❌ Role não permitido:', userRole);
      throw new Error('Acesso negado: você não tem permissão para visualizar usuários');
    }
    
    console.log('✅ Acesso liberado para role:', userRole);
  }

  getUsers(): Observable<User[]> {
    this.checkViewAccess(); // Permite visualização para admin e user
    return this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar usuários:', error);
        return throwError(() => new Error('Falha ao carregar usuários'));
      })
    );
  }

  getCountUsers(): Observable<number> {
    this.checkViewAccess(); // Permite visualização para admin e user
    return this.http.get<{ count: number }>(`${environment.apiUrl}/users/count`).pipe(
      map(response => response.count),
      catchError((error) => {
        console.error('Erro ao buscar contagem de usuários:', error);
        // Fallback: contar manualmente se a API não tiver endpoint /count
        return this.getUsers().pipe(
          map(users => users.length)
        );
      })
    );
  }

  // Obter estatísticas por role
  getUsersByRole(): Observable<{role: string, count: number}[]> {
    this.checkViewAccess();
    return this.getUsers().pipe(
      map(users => {
        const roleMap = new Map<string, number>();
        
        users.forEach(user => {
          const role = user.role;
          roleMap.set(role, (roleMap.get(role) || 0) + 1);
        });
        
        return Array.from(roleMap.entries()).map(([role, count]) => ({
          role: role === 'admin' ? 'Administradores' : 'Usuários',
          count
        }));
      })
    );
  }

  // Obter estatísticas gerais de usuários
  getUsersStats(): Observable<{
    totalUsers: number,
    adminCount: number,
    userCount: number,
    averageAge: number
  }> {
    this.checkViewAccess();
    return this.getUsers().pipe(
      map(users => {
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;
        const averageAge = users.length > 0 
          ? Math.round(users.reduce((sum, user) => sum + user.age, 0) / users.length)
          : 0;
        
        return {
          totalUsers: users.length,
          adminCount,
          userCount,
          averageAge
        };
      })
    );
  }

  getUserById(id: number): Observable<User> {
    this.checkViewAccess(); // Permite visualização para admin e user
    const url = `${environment.apiUrl}/users/${id}`;
    console.log('🔍 GET Request URL:', url);
    
    return this.http.get<User>(url).pipe(
      catchError((error) => {
        console.error('❌ GET Error Details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          headers: error.headers
        });
        if (error.status === 404) {
          return throwError(() => error);
        }
        return throwError(() => new Error('Usuário não encontrado'));
      })
    );
  }

  getUserByName(name: string): Observable<User[]> {
    this.checkViewAccess(); // Permite visualização para admin e user
    return this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(
      map((users: User[]) => {
        return users.filter(user => 
          user.name.toLowerCase().includes(name.toLowerCase())
        );
      }),
      catchError((error) => {
        console.error('Erro ao buscar usuários por nome:', error);
        return throwError(() => new Error('Falha ao pesquisar usuários'));
      })
    );
  }

  createUser(userData: CreateUserData): Observable<User> {
    this.checkAdminAccess();
    return this.http.post<User>(`${environment.apiUrl}/users`, userData).pipe(
      catchError((error) => {
        console.error('Erro ao criar usuário:', error);
        return throwError(() => new Error('Falha ao criar usuário'));
      })
    );
  }

  editUser(userId: number, userData: UpdateUserData): Observable<User> {
    this.checkAdminAccess();
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}`, userData).pipe(
      catchError((error) => {
        console.error('Erro ao editar usuário:', error);
        return throwError(() => new Error('Falha ao atualizar usuário'));
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    this.checkAdminAccess();
    return this.http.delete(`${environment.apiUrl}/users/${userId}`).pipe(
      catchError((error) => {
        console.error('Erro ao deletar usuário:', error);
        return throwError(() => new Error('Falha ao excluir usuário'));
      })
    );
  }
}
