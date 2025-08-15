import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products/products.service';
import { AuthService } from '../../services/admin/admin.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: any[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  showOnlyBestSellers: boolean = false;
  loading: boolean = true;

  // Subject para debounce da busca
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    // Configurar debounce para a busca
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Aguarda 300ms após parar de digitar
      distinctUntilChanged() // Só executa se o valor mudou
    ).subscribe(searchTerm => {
      this.performSearch();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  private applyFilters(): void {
    let baseProducts = [...this.products];

    // Aplicar filtro de mais vendidos primeiro
    if (this.showOnlyBestSellers) {
      baseProducts = baseProducts.filter(product => product.mais_vendidos === true);
    }

    // Se não há busca nem categoria, mostrar produtos baseados no filtro de mais vendidos
    if ((!this.searchTerm || this.searchTerm.trim() === '') && this.selectedCategory === 'all') {
      this.filteredProducts = baseProducts;
      return;
    }

    // Se há categoria selecionada
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      this.productsService.getProductByCategory(this.selectedCategory).subscribe({
        next: (filteredByCategory) => {
          // Aplicar filtro de mais vendidos
          if (this.showOnlyBestSellers) {
            filteredByCategory = filteredByCategory.filter(product => product.mais_vendidos === true);
          }

          // Aplicar filtro de busca nos resultados da categoria
          if (this.searchTerm && this.searchTerm.trim() !== '') {
            const term = this.searchTerm.toLowerCase().trim();
            this.filteredProducts = filteredByCategory.filter(product =>
              product.descricao?.toLowerCase().includes(term) ||
              product.codigo?.toLowerCase().includes(term) ||
              product.linha_produtos_tintas?.toLowerCase().includes(term) ||
              product.cor_comercial_tinta?.toLowerCase().includes(term)
            );
          } else {
            this.filteredProducts = filteredByCategory;
          }
        },
        error: (error) => {
          console.error('Erro ao filtrar por categoria:', error);
          this.filteredProducts = [];
        }
      });
    } 
    // Se há apenas busca (sem categoria específica)
    else if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      
      // Primeiro tentar busca específica por nome
      this.productsService.getProductByName(term).subscribe({
        next: (product) => {
          if (product) {
            // Aplicar filtro de mais vendidos ao produto encontrado
            if (this.showOnlyBestSellers) {
              this.filteredProducts = product.mais_vendidos ? [product] : [];
            } else {
              this.filteredProducts = [product];
            }
          } else {
            // Se não encontrou por nome exato, fazer busca local em todos os campos
            let searchResults = this.products.filter(p =>
              p.descricao?.toLowerCase().includes(term) ||
              p.codigo?.toLowerCase().includes(term) ||
              p.linha_produtos_tintas?.toLowerCase().includes(term) ||
              p.cor_comercial_tinta?.toLowerCase().includes(term)
            );

            // Aplicar filtro de mais vendidos aos resultados da busca
            if (this.showOnlyBestSellers) {
              searchResults = searchResults.filter(product => product.mais_vendidos === true);
            }

            this.filteredProducts = searchResults;
          }
        },
        error: (error) => {
          console.error('Erro ao buscar produto:', error);
          // Em caso de erro, fazer busca local
          let searchResults = this.products.filter(p =>
            p.descricao?.toLowerCase().includes(term) ||
            p.codigo?.toLowerCase().includes(term) ||
            p.linha_produtos_tintas?.toLowerCase().includes(term) ||
            p.cor_comercial_tinta?.toLowerCase().includes(term)
          );

          // Aplicar filtro de mais vendidos aos resultados da busca
          if (this.showOnlyBestSellers) {
            searchResults = searchResults.filter(product => product.mais_vendidos === true);
          }

          this.filteredProducts = searchResults;
        }
      });
    }
  }

  // Método chamado pelo debounce
  private performSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onBestSellersFilterChange(): void {
    this.applyFilters();
  }

  // Método chamado pelo template (input)
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Método para limpar filtros
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filteredProducts = [...this.products];
  }

  deleteProduct(id: number): void {
    if (!this.canEdit()) {
      alert('Você não tem permissão para excluir produtos.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productsService.deleteProduct(id).subscribe({
        next: (success) => {
          if (success) {
            this.loadProducts(); // Recarregar lista
          }
        },
        error: (error) => {
          console.error('Erro ao excluir produto:', error);
        }
      });
    }
  }

  editProduct(id: number): void {
    if (this.canEdit()) {
      this.router.navigate(['/admin/products/edit', id]);
    }
  }

  // Método para verificar se o usuário pode editar
  canEdit(): boolean {
    return this.authService.canEdit();
  }

  // Método para verificar se o usuário pode visualizar
  canView(): boolean {
    return this.authService.canView();
  }

  // Método para obter URL da imagem do produto
  getProductImageUrl(product: Product): string {
    // Verificar se photo é uma string base64
    if (product.photo && typeof product.photo === 'string') {
      // Se já tem o prefixo data:image, usar diretamente
      if (product.photo.startsWith('data:image/')) {
        return product.photo;
      }
      // Se é apenas a string base64, adicionar o prefixo
      return `data:image/jpeg;base64,${product.photo}`;
    }
    
    // Usar photo_url como fallback
    if (product.photo_url) {
      return product.photo_url;
    }
    
    // Imagem padrão se não houver nenhuma
    return 'assets/images/cartShoppingTinta.svg';
  }
}
