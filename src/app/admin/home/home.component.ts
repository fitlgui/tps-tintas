import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products/products.service';
import { UsersService } from 'src/app/services/users/users.service';
import { AuthService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Estatísticas gerais
  totalProducts: number = 0;
  totalActiveUsers: number = 0;
  totalCategories: number = 0;
  totalColors: number = 0;

  // Produtos por categoria
  productsByCategory: {category: string, count: number}[] = [];
  
  // Loading states
  loadingProducts = true;
  loadingUsers = true;
  
  // User info
  currentUser: any = null;

  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserInfo();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loadProductsData();
    this.loadUsersData();
  }

  private loadProductsData(): void {
    this.loadingProducts = true;
    
    // Carregar estatísticas gerais de produtos
    this.productsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalProducts = stats.totalProducts;
        this.totalCategories = stats.totalCategories;
        this.totalColors = stats.totalColors;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas de produtos:', error);
      }
    });

    // Carregar produtos por categoria
    this.productsService.getProductsByCategory().subscribe({
      next: (data) => {
        this.productsByCategory = data.slice(0, 8); // Top 8 categorias
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos por categoria:', error);
        this.loadingProducts = false;
      }
    });
  }

  private loadUsersData(): void {
    this.loadingUsers = true;
    
    // Carregar contagem simples de usuários
    this.usersService.getCountUsers().subscribe({
      next: (count) => {
        this.totalActiveUsers = count;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contagem de usuários:', error);
        this.loadingUsers = false;
      }
    });
  }

  // Método para verificar se o usuário pode editar
  canEdit(): boolean {
    return this.authService.canEdit();
  }

  // Método para obter saudação baseada no horário
  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.currentUser?.name || 'Usuário';

    if (hour > 6 && hour < 12) {
      return `Bom dia, ${name}!`;
    } else if (hour > 12 && hour < 18) {
      return `Boa tarde, ${name}!`;
    } else {
      return `Boa noite, ${name}!`;
    }
  }

  // Método para obter porcentagem
  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
