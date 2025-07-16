import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products/products.service';
import { CartService } from '../../services/cart/cart.service';

interface ExtendedProduct extends Product {
  description?: string;
  features?: string[];
  inStock: boolean;
  stockQuantity: number;
}

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  product: ExtendedProduct | null = null;
  loading = true;
  error = '';
  cartService = inject(CartService);
  quantity = 1;
  selectedImage = 0;

  // Imagens do produto (simuladas)
  productImages = [
    'assets/images/largeTintaWEG.svg',
    'assets/images/cartShoppingTinta.svg',
    'assets/images/logoWEG.svg'
  ];

  // Produtos relacionados
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
        this.loadRelatedProducts();
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = '';

    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = {
            ...product,
            description: this.generateDescription(product),
            features: this.generateFeatures(product),
            inStock: true,
            stockQuantity: Math.floor(Math.random() * 50) + 10
          };
        } else {
          this.error = 'Produto não encontrado';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar produto';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadRelatedProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id)
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos relacionados:', err);
      }
    });
  }

  generateDescription(product: Product): string {
    return `A ${product.name} da ${product.brand} é a escolha perfeita para seus projetos.
    Com qualidade superior e durabilidade comprovada, esta tinta de ${product.color}
    oferece excelente cobertura e acabamento profissional. Ideal para ${product.category.toLowerCase()},
    disponível em tamanho ${product.size}.`;
  }

  generateFeatures(product: Product): string[] {
    return [
      'Alta durabilidade e resistência',
      'Excelente cobertura e poder de tingimento',
      'Secagem rápida',
      'Fácil aplicação',
      'Resistente a intempéries',
      'Baixo odor',
      `Cor: ${product.color}`,
      `Tamanho: ${product.size}`,
      'Garantia de qualidade WEG'
    ];
  }

  getFinalPrice(): number {
    if (!this.product) return 0;
    return this.product.price - (this.product.price * this.product.descont / 100);
  }

  getSavings(): number {
    if (!this.product) return 0;
    return this.product.price * this.product.descont / 100;
  }

  increaseQuantity(): void {
    if (this.quantity < (this.product?.stockQuantity || 1)) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    // Adicionar ao carrinho usando o serviço
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Feedback visual
    console.log(`Adicionado ao carrinho: ${this.quantity}x ${this.product.name}`);
    
    // Abrir o carrinho para mostrar o produto adicionado
    this.cartService.openCart();
  }

  buyNow(): void {
    if (!this.product) return;

    // Adicionar ao carrinho e enviar para WhatsApp
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Enviar direto para WhatsApp
    this.cartService.sendToWhatsApp();
    
    console.log(`Compra direta: ${this.quantity}x ${this.product.name}`);
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/catalog', productId]);
  }
}
