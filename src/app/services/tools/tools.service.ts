import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  // Função para converter buffer em data URL
  private bufferToDataUrl(buffer: any): string | null {
    if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
      return null;
    }
    
    try {
      // Converter array de bytes para Uint8Array
      const uint8Array = new Uint8Array(buffer.data);
      
      // Converter para base64
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      // Assumir formato JPEG por padrão
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Erro ao converter buffer para data URL:', error);
      return null;
    }
  }

  // Função para obter a URL da imagem da ferramenta
  getToolImageUrl(tool: Tool): string {
    // Se photo é uma string base64, usar diretamente
    if (tool.photo && typeof tool.photo === 'string') {
      // Se já tem o prefixo data:image, usar diretamente
      if (tool.photo.startsWith('data:image/')) {
        return tool.photo;
      }
      // Se é apenas a string base64, adicionar o prefixo
      return `data:image/jpeg;base64,${tool.photo}`;
    }

    // Tentar converter o buffer (quando vem do GET da API)
    if (tool.photo && typeof tool.photo === 'object') {
      const dataUrl = this.bufferToDataUrl(tool.photo);
      if (dataUrl) {
        return dataUrl;
      }
    }
    
    // Imagem padrão se não houver nenhuma
    return 'assets/images/cartShoppingTinta.svg';
  }

  // Processar ferramentas vindas da API (converter buffer para string base64 se necessário)
  private processToolsImages(tools: Tool[]): Tool[] {
    return tools.map(tool => {
      // Se photo é um buffer, converter para string base64
      if (tool.photo && typeof tool.photo === 'object') {
        const dataUrl = this.bufferToDataUrl(tool.photo);
        if (dataUrl) {
          // Extrair apenas a parte base64 (sem o prefixo data:image...)
          const base64Data = dataUrl.split(',')[1];
          tool.photo = base64Data;
        }
      }
      return tool;
    });
  }

  // Verificar se o usuário pode editar ferramentas (apenas para operações administrativas)
  checkAdminAccess(): boolean {
    if (!this.authService.canEdit()) {
      console.error('Acesso negado: apenas administradores podem gerenciar ferramentas');
      return false;
    }
    return true;
  }

  // Buscar todas as ferramentas (público, sem autenticação)
  getTools(): Observable<Tool[]> {
    return this.http.get<Tool[]>(this.apiUrl).pipe(
      map((tools: Tool[]) => this.processToolsImages(tools)),
      catchError(error => {
        console.error('Erro ao buscar ferramentas:', error);
        return of([]);
      })
    );
  }

  // Buscar ferramenta por ID (público, sem autenticação)
  getToolById(id: number): Observable<Tool | null> {
    return this.http.get<Tool>(`${this.apiUrl}/${id}`).pipe(
      map((tool: Tool) => {
        if (tool) {
          // Se photo é um buffer, converter para string base64
          if (tool.photo && typeof tool.photo === 'object') {
            const dataUrl = this.bufferToDataUrl(tool.photo);
            if (dataUrl) {
              // Extrair apenas a parte base64 (sem o prefixo data:image...)
              const base64Data = dataUrl.split(',')[1];
              tool.photo = base64Data;
            }
          }
        }
        return tool;
      }),
      catchError(error => {
        console.error('Erro ao buscar ferramenta:', error);
        return of(null);
      })
    );
  }

  // Buscar ferramenta por nome (público, sem autenticação)
  getToolByName(name: string): Observable<Tool | null> {
    if (!name) {
      return of(null);
    }

    return this.getTools().pipe(
      map(tools => {
        const tool = tools.find(t => t.nome.toLowerCase().includes(name.toLowerCase()));
        return tool || null;
      })
    );
  }

  // Criar nova ferramenta (apenas administradores)
  createTool(tool: CreateToolRequest): Observable<Tool> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Acesso negado: apenas administradores podem criar ferramentas'));
    }

    // Garantir que photo seja enviado como string base64 (sem prefixo data:image)
    const toolToSend = { ...tool };
    if (toolToSend.photo && typeof toolToSend.photo === 'string' && toolToSend.photo.startsWith('data:image/')) {
      // Extrair apenas a parte base64
      toolToSend.photo = toolToSend.photo.split(',')[1];
    }

    return this.http.post<Tool>(this.apiUrl, toolToSend).pipe(
      catchError(error => {
        console.error('Erro ao criar ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Atualizar ferramenta (apenas administradores)
  updateTool(id: number, tool: UpdateToolRequest): Observable<Tool> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Acesso negado: apenas administradores podem atualizar ferramentas'));
    }

    // Garantir que photo seja enviado como string base64 (sem prefixo data:image)
    const toolToSend = { ...tool };
    if (toolToSend.photo && typeof toolToSend.photo === 'string' && toolToSend.photo.startsWith('data:image/')) {
      // Extrair apenas a parte base64
      toolToSend.photo = toolToSend.photo.split(',')[1];
    }

    return this.http.patch<Tool>(`${this.apiUrl}/${id}`, toolToSend).pipe(
      catchError(error => {
        console.error('Erro ao atualizar ferramenta:', error);
        return throwError(() => error);
      })
    );
  }

  // Excluir ferramenta (apenas administradores)
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

  // Obter contagem total de ferramentas (público)
  getCountAllTools(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`).pipe(
      catchError(error => {
        console.error('Erro ao buscar contagem de ferramentas:', error);
        return of(0);
      })
    );
  }

  // Obter estatísticas das ferramentas para o dashboard (apenas administradores)
  getDashboardStats(): Observable<{
    totalTools: number;
    averagePrice: number;
    mostExpensive: Tool | null;
    cheapest: Tool | null;
  }> {
    return this.getTools().pipe(
      map(tools => {
        if (tools.length === 0) {
          return {
            totalTools: 0,
            averagePrice: 0,
            mostExpensive: null,
            cheapest: null
          };
        }

        const totalTools = tools.length;
        const averagePrice = tools.reduce((sum, tool) => sum + tool.preco, 0) / totalTools;
        const mostExpensive = tools.reduce((max, tool) => tool.preco > max.preco ? tool : max);
        const cheapest = tools.reduce((min, tool) => tool.preco < min.preco ? tool : min);

        return {
          totalTools,
          averagePrice,
          mostExpensive,
          cheapest
        };
      }),
      catchError(error => {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        return of({
          totalTools: 0,
          averagePrice: 0,
          mostExpensive: null,
          cheapest: null
        });
      })
    );
  }

  // Buscar ferramentas por faixa de preço (público)
  getToolsByPriceRange(minPrice: number, maxPrice: number): Observable<Tool[]> {
    return this.getTools().pipe(
      map(tools => tools.filter(tool => tool.preco >= minPrice && tool.preco <= maxPrice)),
      catchError(error => {
        console.error('Erro ao buscar ferramentas por faixa de preço:', error);
        return of([]);
      })
    );
  }
}
