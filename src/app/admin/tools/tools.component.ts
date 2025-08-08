import { Component, OnInit } from '@angular/core';
import { ToolsService, Tool } from 'src/app/services/tools/tools.service';
import { AuthService } from 'src/app/services/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  tools: Tool[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  filteredTools: Tool[] = [];
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Filtros
  sortBy: 'nome' | 'preco' | 'created_at' = 'nome';
  sortOrder: 'asc' | 'desc' = 'asc';
  priceRange = {
    min: 0,
    max: 1000
  };

  constructor(
    private toolsService: ToolsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Debug: verificar status de autenticação
    console.log('ToolsComponent - Status de login:', this.authService.isLoggedIn());
    console.log('ToolsComponent - Pode visualizar:', this.authService.canView());
    console.log('ToolsComponent - Pode editar:', this.authService.canEdit());
    console.log('ToolsComponent - Usuário atual:', this.authService.getCurrentUserInfo());
    
    this.loadTools();
  }

  loadTools(): void {
    this.loading = true;
    this.error = null;
    
    this.toolsService.getTools().subscribe({
      next: (tools) => {
        this.tools = tools;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar ferramentas: ' + error.message;
        this.loading = false;
        console.error('Erro ao carregar ferramentas:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.tools];
    
    // Filtro por termo de busca
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.nome.toLowerCase().includes(term) ||
        tool.descricao.toLowerCase().includes(term) ||
        tool.info_tecnica.toLowerCase().includes(term)
      );
    }
    
    // Filtro por faixa de preço
    filtered = filtered.filter(tool => 
      tool.preco >= this.priceRange.min && tool.preco <= this.priceRange.max
    );
    
    // Ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (this.sortBy) {
        case 'nome':
          valueA = a.nome.toLowerCase();
          valueB = b.nome.toLowerCase();
          break;
        case 'preco':
          valueA = a.preco;
          valueB = b.preco;
          break;
        case 'created_at':
          valueA = new Date(a.created_at || '');
          valueB = new Date(b.created_at || '');
          break;
        default:
          valueA = a.nome.toLowerCase();
          valueB = b.nome.toLowerCase();
      }
      
      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.filteredTools = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  getPaginatedTools(): Tool[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTools.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Verificações de permissão
  canView(): boolean {
    return this.authService.canView();
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }

  // Navegação
  viewTool(id: number): void {
    this.router.navigate(['/admin/tools/view', id]);
  }

  editTool(id: number): void {
    if (this.canEdit()) {
      this.router.navigate(['/admin/tools/edit', id]);
    }
  }

  addTool(): void {
    if (this.canEdit()) {
      this.router.navigate(['/admin/tools/add']);
    }
  }

  // Excluir ferramenta
  deleteTool(tool: Tool): void {
    if (!this.canEdit() || !tool.id) {
      return;
    }
    
    const confirmDelete = confirm(`Tem certeza que deseja excluir a ferramenta "${tool.nome}"?`);
    
    if (confirmDelete) {
      this.toolsService.deleteTool(tool.id).subscribe({
        next: () => {
          this.loadTools();
          alert('Ferramenta excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir ferramenta:', error);
          alert('Erro ao excluir ferramenta: ' + error.message);
        }
      });
    }
  }

  // Formatação
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Método para ter acesso ao Math no template
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
