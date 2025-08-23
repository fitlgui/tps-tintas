import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products/products.service';
import { ToolsService, Tool } from '../../services/tools/tools.service';
import { CartService } from '../../services/cart/cart.service';

interface ExtendedProduct extends Product {
  description?: string;
  features?: string[];
  inStock: boolean;
  stockQuantity: number;
}

interface ExtendedTool extends Tool {
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
  tool: ExtendedTool | null = null;
  isToolView: boolean = false;
  loading = true;
  error = '';
  cartService = inject(CartService);
  quantity = 1;
  selectedImage = 0;

  // Imagens do item (serão carregadas dinamicamente)
  productImages: string[] = [];

  // Produtos/ferramentas relacionados
  relatedItems: (Product | Tool)[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private toolsService: ToolsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      const url = this.router.url;
      
      // Detectar se é uma ferramenta pela URL
      this.isToolView = url.includes('/tools/');
      
      if (id) {
        if (this.isToolView) {
          this.loadTool(id);
        } else {
          this.loadProduct(id);
        }
        this.loadRelatedItems();
      }
    });
  }

  loadTool(id: number): void {
    this.loading = true;
    this.error = '';

    this.toolsService.getToolById(id).subscribe({
      next: (tool) => {
        if (tool) {
          this.tool = {
            ...tool,
            description: this.generateToolDescription(tool),
            features: this.generateToolFeatures(tool),
            inStock: true, // Ferramentas sempre disponíveis
            stockQuantity: 999
          };

          // Carregar imagens da ferramenta
          this.loadToolImages(tool);
        } else {
          this.error = 'Ferramenta não encontrada';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar ferramenta';
        this.loading = false;
        console.error(err);
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

  loadToolImages(tool: Tool): void {
    // Se há imagem da ferramenta, usar ela
    if (tool.photo && tool.photo !== '') {
      const imageUrl = `data:image/jpeg;base64,${tool.photo}`;
      this.productImages = [imageUrl];
    } else {
      // Usar imagens padrão se não houver imagem da ferramenta
      this.productImages = [
        'assets/images/cartShoppingTinta.svg',
        'assets/images/logoWEG.svg'
      ];
    }
    
    // Reset para primeira imagem
    this.selectedImage = 0;
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
        this.relatedItems = products
          .filter(p => p.id !== this.product?.id && p.quantidade_por_fardo >= 1)
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos relacionados:', err);
      }
    });
  }

  loadRelatedItems(): void {
    if (this.isToolView) {
      this.loadRelatedTools();
    } else {
      this.loadRelatedProducts();
    }
  }

  loadRelatedTools(): void {
    this.toolsService.getTools().subscribe({
      next: (tools) => {
        // Filtrar ferramentas diferentes da ferramenta atual
        this.relatedItems = tools
          .filter(t => t.id !== this.tool?.id)
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Erro ao carregar ferramentas relacionadas:', err);
      }
    });
  }

  generateToolDescription(tool: Tool): string {
    return `${tool.nome} é uma ferramenta profissional que oferece ${tool.descricao}. 
    Com informações técnicas detalhadas e qualidade garantida, esta ferramenta é ideal 
    para projetos que exigem precisão e confiabilidade. ${tool.info_tecnica ? 
    'Características técnicas: ' + tool.info_tecnica : ''}`;
  }

  generateToolFeatures(tool: Tool): string[] {
    const features = [];
    
    // Características básicas
    features.push('Ferramenta profissional de alta qualidade');
    features.push('Ideal para projetos com tintas WEG');
    
    // Informações específicas da ferramenta
    if (tool.nome) features.push(`Nome: ${tool.nome}`);
    if (tool.descricao) features.push(`Descrição: ${tool.descricao}`);
    if (tool.info_tecnica) features.push(`Informação técnica: ${tool.info_tecnica}`);
    if (tool.preco) features.push(`Preço: R$ ${tool.preco }`);
    
    features.push('Garantia de qualidade');
    features.push('Suporte técnico especializado');
    
    return features;
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
    features.push('Garantia de qualidade WEG');
    
    return features;
  }

  getFinalPrice(): any {
    if (this.isToolView && this.tool) {
      if (this.tool.preco <= 0) return 'Consultar Valor';
      return this.tool.preco;
    }
    if (!this.isToolView && this.product) {
      if (this.product.preco <= 0) return 'Consultar Valor';
      return this.product.preco;
    }
    return 'Consultar Valor';
  }

  getCurrentItem(): ExtendedProduct | ExtendedTool | null {
    return this.isToolView ? this.tool : this.product;
  }

  increaseQuantity(): void {
    if (this.isToolView) {
      if (this.quantity < (this.tool?.stockQuantity || 1)) {
        this.quantity++;
      }
    } else {
      if (this.quantity < (this.product?.stockQuantity || 1)) {
        this.quantity++;
      }
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.isToolView && this.tool) {
      // Adicionar ferramenta ao carrinho
      this.cartService.addToolToCart(this.tool as Tool, this.quantity);
      
      // Abrir o carrinho para mostrar o produto adicionado
      this.cartService.openCart();
      return;
    }

    if (!this.product) return;

    // Adicionar produto ao carrinho usando o serviço
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Abrir o carrinho para mostrar o produto adicionado
    this.cartService.openCart();
  }

  buyNow(): void {
    if (this.isToolView && this.tool) {
      // Adicionar ferramenta ao carrinho e enviar para WhatsApp
      this.cartService.addToolToCart(this.tool as Tool, this.quantity);
      
      // Enviar direto para WhatsApp
      this.cartService.sendToWhatsApp();
      
      return;
    }

    if (!this.product) return;

    // Adicionar ao carrinho e enviar para WhatsApp
    this.cartService.addToCart(this.product as Product, this.quantity);
    
    // Enviar direto para WhatsApp
    this.cartService.sendToWhatsApp();
    
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  goToCatalog(): void {
    if (this.isToolView) {
      this.router.navigate(['/tools']);
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/catalog', productId]);
  }

  viewRelatedTool(toolId: number): void {
    this.router.navigate(['/tools', toolId]);
  }

  viewRelatedItem(item: Product | Tool): void {
    // Verificar se é produto ou ferramenta baseado nas propriedades
    if ('familia_tintas' in item) {
      // É um produto
      this.viewRelatedProduct(item.id);
    } else {
      // É uma ferramenta
      this.viewRelatedTool(item.id!);
    }
  }

  // Métodos auxiliares para templates
  getItemName(item: Product | Tool): string {
    return 'nome' in item ? item.nome : item.descricao;
  }

  getItemImageUrl(item: Product | Tool): string {
    if ('nome' in item) {
      // É uma ferramenta
      return this.getToolImageUrl(item as Tool);
    } else {
      // É um produto
      return this.getProductImageUrl(item as Product);
    }
  }

  getToolImageUrl(tool: Tool): string {
    if (tool.photo && typeof tool.photo === 'string') {
      if (tool.photo.startsWith('data:image/')) {
        return tool.photo;
      }
      return `data:image/jpeg;base64,${tool.photo}`;
    }
    return 'assets/images/cartShoppingTinta.svg';
  }

  getProductImageUrl(product: Product): string {
    if (product.photo && typeof product.photo === 'string') {
      if (product.photo.startsWith('data:image/')) {
        return product.photo;
      }
      return `data:image/jpeg;base64,${product.photo}`;
    }
    
    if (product.photo_url) {
      return product.photo_url;
    }
    
    return 'assets/images/cartShoppingTinta.svg';
  }

  getItemSubtitle(item: Product | Tool): string {
    return 'linha_produtos_tintas' in item ? item.linha_produtos_tintas : '';
  }
}
