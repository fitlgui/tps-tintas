import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from 'src/app/services/products/products.service';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  // Variavel para armazenar os produtos
  public allProducts: any[] = [];
  public products: any[] = [];

  // Variavel para armazenar as categorias
  public categories: any[] = [];

  // Variavel para armazenar as marcas
  public brands: any[] = [];

  // Variavel para armazenar os tamanhos
  public sizes: any[] = [];

  // Variavel para armazenar as cores
  public colors: any[] = [];

  public selectedCategories: Set<string> = new Set();
  public selectedBrands: Set<string> = new Set();
  public selectedSizes: Set<string> = new Set();
  public selectedColors: Set<string> = new Set();

  // Filtros de preço
  public minPrice: number = 0;
  public maxPrice: number = 0;

  // Injetar o serviço do carrinho
  cartService = inject(CartService);

  constructor(
    private readonly productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(){

    // Buscando Todos os Produtos
    this.productsService.getProducts().subscribe((data: any[]) => {
      this.allProducts = data;
      this.products = data;
      // Definir preços mínimo e máximo automaticamente
      this.setDefaultPriceRange();
    })

    // Buscar Todas as Categorias
    this.productsService.getCategories().subscribe((data: any[]) => {
      this.categories = data
    })

    // Buscar Todas as Marcas
    this.productsService.getProducts().subscribe((data: any[]) => {
      // Se for igual retirar a repetição
      this.brands = [...new Set(data.map(product => product.brand))];
      return this.brands;
    });

    // Buscar Todos os Tamanhos
    this.productsService.getSize().subscribe((data: any[]) => {
      this.sizes = data
    });

    // Buscar Todas as Cores
    this.productsService.getColors().subscribe((data: any[]) => {
      this.colors = data;
    });
  }

  private setDefaultPriceRange() {
    if (this.allProducts.length > 0) {
      const prices = this.allProducts.map(product => product.price);
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
    }
  }

  private applyFilters() {
    let filteredProducts = [...this.allProducts];

    if (this.selectedCategories.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedCategories.has(product.category));
    }

    if (this.selectedBrands.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedBrands.has(product.brand));
    }

    if (this.selectedSizes.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedSizes.has(product.size));
    }

    if (this.selectedColors.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedColors.has(product.color));
    }

    this.products = filteredProducts;
  }

  // Filtrar por preço
  filterByPrice(minPrice: number, maxPrice: number) {
    if (minPrice < 0) minPrice = 0;
    if (maxPrice <= 0) maxPrice = this.getMaxPrice();
    if (minPrice > maxPrice) {
      // Trocar valores se mínimo for maior que máximo
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }

    let filteredProducts = [...this.allProducts];

    // Aplicar filtros existentes primeiro
    if (this.selectedCategories.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedCategories.has(product.category));
    }

    if (this.selectedBrands.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedBrands.has(product.brand));
    }

    if (this.selectedSizes.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedSizes.has(product.size));
    }

    if (this.selectedColors.size > 0) {
      filteredProducts = filteredProducts.filter(product => this.selectedColors.has(product.color));
    }

    // Aplicar filtro de preço
    filteredProducts = filteredProducts.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );

    this.products = filteredProducts;
  }

  // Pegar preço máximo dos produtos
  getMaxPrice(): number {
    if (this.allProducts.length === 0) return 1000;
    return Math.max(...this.allProducts.map(product => product.price));
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

  // Mostrar os produtos por marca
  getProductBrand(event: any, brand: string) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedBrands.add(brand);
    } else {
      this.selectedBrands.delete(brand);
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
    return this.allProducts.filter(product => product.size === size).length;
  }

  // Mostrar o numero de produtos por Cor
  getNumberOfProductsByColor(color: string): number {
    return this.allProducts.filter(product => product.color === color).length;
  }

  // Navegar para detalhes do produto
  viewProductDetails(productId: number) {
    this.router.navigate(['/catalog', productId]);
  }

  // Limpar todos os filtros
  clearAllFilters() {
    this.selectedCategories.clear();
    this.selectedBrands.clear();
    this.selectedSizes.clear();
    this.selectedColors.clear();
    this.products = [...this.allProducts];
    this.setDefaultPriceRange();
  }

  // Adicionar produto ao carrinho
  addToCart(product: Product) {
    this.cartService.addToCart(product, 1);
    // Opcional: mostrar toast de sucesso
    console.log('Produto adicionado ao carrinho:', product.name);
  }

  // Navegar para página de detalhes do produto
  goToProduct(productId: number) {
    this.router.navigate(['/catalog', productId]);
  }
}
