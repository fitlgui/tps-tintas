import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products/products.service';

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


  constructor(private readonly productsService: ProductsService) {}

  ngOnInit(){

    // Buscando Todos os Produtos
    this.productsService.getProducts().subscribe((data: any[]) => {
      this.allProducts = data;
      this.products = data
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
    return this.products.filter(product => product.size === size).length;
  }

  // Mostrar o numero de produtos por Cor
  getNumberOfProductsByColor(color: string): number {
    return this.products.filter(product => product.color === color).length;
  }
}
