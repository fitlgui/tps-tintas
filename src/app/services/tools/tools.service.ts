import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environment/enviroment';
import { AuthService } from '../admin/admin.service';

export interface Tool {
  id?: number;
  nome: string;
  preco: number;
  descricao: string;
  info_tecnica: string;
  photo?: string; // Campo para imagem em base64
  created_at?: string;
  updated_at?: string;
}

export interface CreateToolRequest {
  nome: string;
  preco: number;
  descricao: string;
  info_tecnica: string;
  photo?: string; // Campo para imagem em base64
}

export interface UpdateToolRequest {
  nome?: string;
  preco?: number;
  descricao?: string;
  info_tecnica?: string;
  photo?: string; // Campo para imagem em base64
}

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private apiUrl = `${environment.apiUrl}/tools`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Verificar se o usuário pode visualizar ferramentas
  checkViewAccess(): boolean {
    // Se não está logado, nega acesso
    if (!this.authService.isLoggedIn()) {
      console.error('Acesso negado: usuário não está logado');
      return false;
    }

    // Se está logado, permite visualização (admin ou user)
    return true;
  }

  // Verificar se o usuário pode editar ferramentas
  checkAdminAccess(): boolean {
    if (!this.authService.canEdit()) {
      console.error('Acesso negado: apenas administradores podem gerenciar ferramentas');
      return false;
    }
    return true;
  }

  // Buscar todas as ferramentas
  getTools(): Observable<Tool[]> {
    if (!this.checkViewAccess()) {
      return throwError(() => new Error('Acesso negado: usuário não está logado'));
    }

    return this.http.get<Tool[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar ferramentas:', error);
        return throwError(() => error);
      })
    );
  }

  // Buscar ferramenta por ID
  getToolById(id: number): Observable<Tool> {
    if (!this.checkViewAccess()) {
      return throwError(() => new Error('Acesso negado: usuário não está logado'));
    }

    return this.http.get<Tool>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Criar nova ferramenta
  createTool(tool: CreateToolRequest): Observable<Tool> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Acesso negado: apenas administradores podem criar ferramentas'));
    }

    return this.http.post<Tool>(this.apiUrl, tool).pipe(
      catchError(error => {
        console.error('Erro ao criar ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Atualizar ferramenta
  updateTool(id: number, tool: UpdateToolRequest): Observable<Tool> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Acesso negado: apenas administradores podem atualizar ferramentas'));
    }

    return this.http.patch<Tool>(`${this.apiUrl}/${id}`, tool).pipe(
      catchError(error => {
        console.error('Erro ao atualizar ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Excluir ferramenta
  deleteTool(id: number): Observable<void> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Acesso negado: apenas administradores podem excluir ferramentas'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao excluir ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Obter estatísticas das ferramentas para o dashboard
  getDashboardStats(): Observable<{
    totalTools: number;
    averagePrice: number;
    mostExpensive: Tool | null;
    cheapest: Tool | null;
  }> {
    if (!this.checkViewAccess()) {
      return throwError(() => new Error('Acesso negado: usuário não está logado'));
    }

    return this.http.get<{
      totalTools: number;
      averagePrice: number;
      mostExpensive: Tool | null;
      cheapest: Tool | null;
    }>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError(error => {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        return throwError(() => error);
      })
    );
  }

  // Buscar ferramentas por faixa de preço
  getToolsByPriceRange(minPrice: number, maxPrice: number): Observable<Tool[]> {
    if (!this.checkViewAccess()) {
      return throwError(() => new Error('Acesso negado: usuário não está logado'));
    }

    return this.http.get<Tool[]>(`${this.apiUrl}/price-range?min=${minPrice}&max=${maxPrice}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar ferramentas por faixa de preço:', error);
        return throwError(() => error);
      })
    );
  }
}
