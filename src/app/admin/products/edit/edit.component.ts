import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../../services/products/products.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  productId!: number;
  product: Product = {
    id: 0,
    name: '',
    price: 0,
    category: '',
    brand: '',
    size: '',
    descont: 0,
    color: '',
    image: '../../../assets/images/cartShoppingTinta.svg'
  };

  originalProduct: Product | null = null;
  categories: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  brands: string[] = [];
  loading = false;
  loadingProduct = true;
  errors: any = {};
  productNotFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    // Obter ID da rota
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct();
        this.loadFormData();
      } else {
        this.productNotFound = true;
        this.loadingProduct = false;
      }
    });
  }

  loadProduct(): void {
    this.loadingProduct = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = { ...product };
          this.originalProduct = { ...product };
          this.productNotFound = false;
        } else {
          this.productNotFound = true;
        }
        this.loadingProduct = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.productNotFound = true;
        this.loadingProduct = false;
      }
    });
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

  hasChanges(): boolean {
    if (!this.originalProduct) return false;

    return JSON.stringify(this.product) !== JSON.stringify(this.originalProduct);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.productsService.updateProduct(this.productId, this.product).subscribe({
      next: (updatedProduct) => {
        console.log('Produto atualizado:', updatedProduct);
        this.loading = false;
        // Redirecionar para lista de produtos
        this.router.navigate(['/admin/produtos']);
      },
      error: (error) => {
        console.error('Erro ao atualizar produto:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
  }

  resetForm(): void {
    if (this.originalProduct) {
      this.product = { ...this.originalProduct };
      this.errors = {};
    }
  }
}
