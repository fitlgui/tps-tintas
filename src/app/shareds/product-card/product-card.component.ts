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

  // Imagens do produto (serão carregadas dinamicamente)
  productImages: string[] = [];

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
          // Verificar se produto está em estoque (quantidade_por_fardo >= 1)
          const isInStock = product.quantidade_por_fardo >= 1;
          
          this.product = {
            ...product,
            description: this.generateDescription(product),
            features: this.generateFeatures(product),
            inStock: isInStock,
            stockQuantity: product.quantidade_por_fardo
          };

          // Carregar imagens do produto
          this.loadProductImages(product);
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

  loadProductImages(product: Product): void {
    // Carregar imagem real do produto
    const productImageUrl = this.productsService.getProductImageUrl(product);
    
    // Se há imagem do produto, usar ela
    if (productImageUrl && !productImageUrl.includes('cartShoppingTinta.svg')) {
      this.productImages = [productImageUrl];
    } else {
      // Usar imagens padrão se não houver imagem do produto
      this.productImages = [
        'assets/images/largeTintaWEG.svg',
        'assets/images/cartShoppingTinta.svg',
        'assets/images/logoWEG.svg'
      ];
    }
    
    // Reset para primeira imagem
    this.selectedImage = 0;
  }

  loadRelatedProducts(): void {
    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        // Filtrar apenas produtos em estoque e diferentes do produto atual
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id && p.quantidade_por_fardo >= 1)
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos relacionados:', err);
      }
    });
  }

  generateDescription(product: Product): string {
    return `A ${product.descricao} é a escolha perfeita para seus projetos.
    Com qualidade superior e durabilidade comprovada, esta tinta de ${product.cor_comercial_tinta}
    oferece excelente cobertura e acabamento profissional. Ideal para ${product.familia_tintas?.toLowerCase()},
    disponível em tamanho ${product.conteudo_embalagem}.`;
  }

  generateFeatures(product: Product): string[] {
    const features = [];
    
    // Características básicas
    features.push('Alta durabilidade e resistência');
    features.push('Excelente cobertura e poder de tingimento');
    
    // Informações específicas do produto
    if (product.codigo) features.push(`Código: ${product.codigo}`);
    if (product.familia_tintas) features.push(`Família: ${product.familia_tintas}`);
    if (product.linha_produtos_tintas) features.push(`Linha: ${product.linha_produtos_tintas}`);
    if (product.cor_comercial_tinta) features.push(`Cor comercial: ${product.cor_comercial_tinta}`);
    if (product.cor_tinta) features.push(`Cor da tinta: ${product.cor_tinta}`);
    if (product.conteudo_embalagem) features.push(`Embalagem: ${product.conteudo_embalagem}`);
    if (product.acabamento_pintura) features.push(`Acabamento: ${product.acabamento_pintura}`);
    if (product.brilho) features.push(`Brilho: ${product.brilho}`);
    if (product.versao_tinta) features.push(`Versão: ${product.versao_tinta}`);
    if (product.funcao_tinta) features.push(`Função: ${product.funcao_tinta}`);
    if (product.relacao_resina) features.push(`Resina: ${product.relacao_resina}`);
    if (product.cura) features.push(`Cura: ${product.cura}`);
    if (product.classificacao_verniz) features.push(`Classificação: ${product.classificacao_verniz}`);
    if (product.massa_especifica) features.push(`Massa específica: ${product.massa_especifica}`);
    if (product.tempo_secagem) features.push(`Tempo de secagem: ${product.tempo_secagem}`);
    if (product.tempo_cura) features.push(`Tempo de cura: ${product.tempo_cura}`);
    if (product.metodo_aplicacao) features.push(`Método de aplicação: ${product.metodo_aplicacao}`);
    if (product.temperatura_aplicacao) features.push(`Temperatura de aplicação: ${product.temperatura_aplicacao}`);
    if (product.ambiente_aplicacao) features.push(`Ambiente de aplicação: ${product.ambiente_aplicacao}`);
    if (product.camadas) features.push(`Camadas: ${product.camadas}`);
    if (product.metodo_preparo) features.push(`Método de preparo: ${product.metodo_preparo}`);
    if (product.processo_pintura) features.push(`Processo de pintura: ${product.processo_pintura}`);
    if (product.embalagem) features.push(`Tipo de embalagem: ${product.embalagem}`);
    if (product.referencia_tinta_liquida) features.push(`Referência tinta líquida: ${product.referencia_tinta_liquida}`);
    if (product.sistema_resina) features.push(`Sistema de resina: ${product.sistema_resina}`);
    if (product.diluente_etq) features.push(`Diluente: ${product.diluente_etq}`);
    
    // Informações de estoque
    features.push(`Quantidade por fardo: ${product.quantidade_por_fardo}`);
    features.push('Garantia de qualidade WEG');
    
    return features;
  }

  getFinalPrice(): number {
    if (!this.product) return 0;
    return this.product.preco;
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
    if (!this.product || !this.product.inStock) return;

    // Adicionar ao carrinho usando o serviço
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Feedback visual
    console.log(`Adicionado ao carrinho: ${this.quantity}x ${this.product.descricao}`);
    
    // Abrir o carrinho para mostrar o produto adicionado
    this.cartService.openCart();
  }

  buyNow(): void {
    if (!this.product || !this.product.inStock) return;

    // Adicionar ao carrinho e enviar para WhatsApp
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Enviar direto para WhatsApp
    this.cartService.sendToWhatsApp();
    
    console.log(`Compra direta: ${this.quantity}x ${this.product.descricao}`);
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
