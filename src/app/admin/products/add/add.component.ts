import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../../services/products/products.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  product = {
    name: '',
    price: 0,
    category: '',
    brand: '',
    size: '',
    descont: 0,
    color: '',
    image: '../../../assets/images/cartShoppingTinta.svg'
  };

  categories: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  brands: string[] = [];
  loading = false;
  errors: any = {};

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData(): void {
    // Carregar categorias
    this.productsService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (error) => console.error('Erro ao carregar categorias:', error)
    });

    // Carregar cores
    this.productsService.getColors().subscribe({
      next: (data) => this.colors = data,
      error: (error) => console.error('Erro ao carregar cores:', error)
    });

    // Carregar tamanhos
    this.productsService.getSize().subscribe({
      next: (data) => this.sizes = data,
      error: (error) => console.error('Erro ao carregar tamanhos:', error)
    });

    // Carregar marcas
    this.productsService.getBrands().subscribe({
      next: (data) => this.brands = data,
      error: (error) => console.error('Erro ao carregar marcas:', error)
    });
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.product.name.trim()) {
      this.errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (this.product.price <= 0) {
      this.errors.price = 'Preço deve ser maior que zero';
      isValid = false;
    }

    if (!this.product.category) {
      this.errors.category = 'Categoria é obrigatória';
      isValid = false;
    }

    if (!this.product.brand) {
      this.errors.brand = 'Marca é obrigatória';
      isValid = false;
    }

    if (!this.product.size) {
      this.errors.size = 'Tamanho é obrigatório';
      isValid = false;
    }

    if (!this.product.color) {
      this.errors.color = 'Cor é obrigatória';
      isValid = false;
    }

    if (this.product.descont < 0 || this.product.descont > 100) {
      this.errors.descont = 'Desconto deve estar entre 0 e 100';
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.productsService.addProduct(this.product).subscribe({
      next: (newProduct) => {
        console.log('Produto adicionado:', newProduct);
        this.loading = false;
        // Redirecionar para lista de produtos
        this.router.navigate(['/admin/produtos']);
      },
      error: (error) => {
        console.error('Erro ao adicionar produto:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
  }
}
