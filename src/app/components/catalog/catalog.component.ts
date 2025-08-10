import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from 'src/app/services/products/products.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { SeoService } from 'src/app/services/seo/seo.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  // Variavel para armazenar os produtos
  public allProducts: Product[] = [];
  public products: Product[] = [];
  public productsToShow: number = 12;

  get hasMoreProducts(): boolean {
    return this.products.length > this.productsToShow;
  }

  get visibleProducts(): Product[] {
    return this.products.slice(0, this.productsToShow);
  }

  // Variavel para armazenar as categorias
  public categories: any[] = [];

  // Variavel para armazenar as marcas
  // public brands: any[] = []; // Removido pois não está sendo usado

  // Variavel para armazenar os tamanhos
  public sizes: any[] = [];

  // Variavel para armazenar as cores
  public colors: any[] = [];

  public selectedCategories: Set<string> = new Set();
  // public selectedBrands: Set<string> = new Set(); // Removido pois não está sendo usado
  public selectedSizes: Set<string> = new Set();
  public selectedColors: Set<string> = new Set();

  // Filtros de preço
  public minPrice: number = 0;
  public maxPrice: number = 0;

  // Paginação
  public indexPage: number = 1;

  // Injetar o serviço do carrinho
  cartService = inject(CartService);

  constructor(
    private readonly productsService: ProductsService,
    private router: Router,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(){
    // Configurar SEO para página de catálogo
    this.setupCatalogSeo();

    // Buscando Todos os Produtos primeiro
    this.productsService.getAllProducts().subscribe((data: Product[]) => {
      this.allProducts = data;
  this.products = [...this.allProducts]; // Inicializar produtos exibidos
  this.productsToShow = 12;
      // Definir preços mínimo e máximo automaticamente
      this.setDefaultPriceRange();
    });

    // Buscar Todas as Categorias
    this.productsService.getCategories().subscribe((data: any[]) => {
      this.categories = data;
    });

    // Buscar Todos os Tamanhos
    this.productsService.getSize().subscribe((data: any[]) => {
      this.sizes = data;
    });

    // Buscar Todas as Cores
    this.productsService.getColors().subscribe((data: any[]) => {
      this.colors = data;
    });
  }

  private setDefaultPriceRange() {
    if (this.allProducts.length > 0) {
      const prices = this.allProducts.map(product => product.preco);
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
    }
  }

  private applyFilters() {
    this.applyAllFilters();
  }

  // Filtrar por preço
  filterByPrice(minPrice: number, maxPrice: number) {
    if (minPrice < 0) minPrice = 0;
    if (maxPrice <= 0) maxPrice = this.getMaxPrice();
    if (minPrice > maxPrice) {
      // Trocar valores se mínimo for maior que máximo
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }

    // Aplicar todos os filtros juntos
    this.applyAllFilters(minPrice, maxPrice);
  }

  private applyAllFilters(minPrice?: number, maxPrice?: number) {
    let filteredProducts = [...this.allProducts];

    // Aplicar filtro de categoria
    if (this.selectedCategories.size > 0) {
      filteredProducts = filteredProducts.filter(product => 
        this.selectedCategories.has(product.familia_tintas)
      );
    }

    // Aplicar filtro de tamanho
    if (this.selectedSizes.size > 0) {
      filteredProducts = filteredProducts.filter(product => 
        this.selectedSizes.has(product.conteudo_embalagem)
      );
    }

    // Aplicar filtro de cor
    if (this.selectedColors.size > 0) {
      filteredProducts = filteredProducts.filter(product => 
        this.selectedColors.has(product.cor_comercial_tinta)
      );
    }

    // Aplicar filtro de preço se especificado
    if (minPrice !== undefined && maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.preco >= minPrice && product.preco <= maxPrice
      );
    }

  this.products = filteredProducts;
  this.productsToShow = 12;
  }

  // Pegar preço máximo dos produtos
  getMaxPrice(): number {
    if (this.allProducts.length === 0) return 1000;
    return Math.max(...this.allProducts.map(product => product.preco));
  }

  // Mostrar os produtos por categoria
  getProductsCategory(event: any, category: string) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedCategories.add(category);
    } else {
      this.selectedCategories.delete(category);
    }
    this.applyFilters();
  }

  // Mostrar os produtos por tamanho
  getProductSize(event: any, size: string) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedSizes.add(size);
    } else {
      this.selectedSizes.delete(size);
    }
    this.applyFilters();
  }

  // Mostrar os produtos por cor
  getProductColor(color: string) {
    if (this.selectedColors.has(color)) {
      this.selectedColors.delete(color);
    } else {
      this.selectedColors.add(color);
    }
    this.applyFilters();
  }

  // Mostrar o numero de produtos por Tamanho
  getNumberOfProductsBySize(size: string): number {
    return this.allProducts.filter(product => product.conteudo_embalagem === size).length;
  }

  // Mostrar o numero de produtos por Categoria
  getNumberOfProductsByCategory(category: string): number {
    return this.allProducts.filter(product => product.familia_tintas === category).length;
  }

  // Mostrar o numero de produtos por Cor
  getNumberOfProductsByColor(color: string): number {
    return this.allProducts.filter(product => product.cor_comercial_tinta === color).length;
  }

  // Navegar para detalhes do produto
  viewProductDetails(productId: number) {
    this.router.navigate(['/catalog', productId]);
  }

  // Limpar todos os filtros
  clearAllFilters() {
    this.selectedCategories.clear();
    this.selectedSizes.clear();
    this.selectedColors.clear();
    this.products = [...this.allProducts];
    this.productsToShow = 12;
    this.setDefaultPriceRange();
    // Resetar os checkboxes no DOM
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  loadMore() {
    this.productsToShow += 12;
  }

  // Adicionar produto ao carrinho
  addToCart(product: Product) {
    this.cartService.addToCart(product, 1);
  }

  // Navegar para página de detalhes do produto
  goToProduct(productId: number) {
    this.router.navigate(['/catalog', productId]);
  }

  private setupCatalogSeo() {
    const routeData = this.route.snapshot.data;
    this.seoService.updateSeoData({
      title: routeData['title'] || 'Catálogo de Tintas WEG - TPS Tintas Cuiabá | Industriais e Automotivas',
      description: routeData['description'] || 'Catálogo completo de tintas WEG industriais, automotivas e residenciais. Cores personalizadas, ferramentas e abrasivos em Cuiabá, Mato Grosso.',
      keywords: routeData['keywords'] || 'catálogo tintas, tintas weg cuiabá, tintas industriais catálogo, preços tintas, cores personalizadas, ferramentas cuiabá',
      url: 'https://tpstintas.com.br/catalog',
      type: 'website'
    });
  }

  // Métodos de Paginação (Simplificados - usando todos os produtos filtrados)
  nextPage() {
    this.indexPage++;
  }

  previousPage() {
    if (this.indexPage > 1) {
      this.indexPage--;
    }
  }
}
