import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from 'src/app/services/products/products.service';
import { BannerService } from 'src/app/services/banner/banner.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { SeoService } from 'src/app/services/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Banner ativo
  public bannerAtivo: any = null;

  // Variável para armazenar os produtos
  public produtos: Product[] = []
  // Variável para armazenar produtos mais vendidos (sempre disponível)
  public produtosMaisVendidos: Product[] = []
  cartService = inject(CartService);
  bannerService = inject(BannerService);

  // Filtro selecionado
  public selectedFilter: string = 'mais-vendidos';
  // Opções de filtro (inicialmente apenas 'Mais vendidos')
  public filterOptions = [
    { label: 'Mais vendidos', value: 'mais-vendidos' }
  ];

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Buscar banner ativo
    this.bannerService.getBanners().subscribe((banners: any[]) => {
      console.log('Banner ativo:', banners);
      // Você encontra o banner ativo...
      this.bannerAtivo = banners.find(banner => banner.ativo) || null;
      console.log('Banner encontrado:', this.bannerAtivo);
    });
    // Configurar SEO para página inicial
    this.setupHomeSeo();
    this.loadProductsByFilter(this.selectedFilter);
    // Carregar produtos mais vendidos para a seção "Os Mais Vendidos"
    this.loadBestSellers();
    // Buscar principais categorias automaticamente
    this.productsService.getProductsByCategory().subscribe(categories => {
      // Pega as 4 principais categorias
      const mainCategories = categories.slice(0, 4);
      this.filterOptions = [
        { label: 'Mais vendidos', value: 'mais-vendidos' },
        ...mainCategories.map(cat => ({ label: cat.category, value: cat.category }))
      ];
    });
  }

  loadBestSellers() {
    this.productsService.getBestSellingProducts().subscribe({
      next: (bestSellers) => {
        this.produtosMaisVendidos = bestSellers;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos mais vendidos:', error);
        this.produtosMaisVendidos = []; // Array vazio em caso de erro
      }
    });
  }

  loadProductsByFilter(filter: string) {
    this.selectedFilter = filter;
    let obs$;
    switch (filter) {
      case 'mais-vendidos':
        // Buscar apenas produtos com mais_vendidos: true
        obs$ = this.productsService.getBestSellingProducts();
        break;
      case 'tinta-liquida':
        obs$ = this.productsService.getProductByCategory('Tinta Líquida');
        break;
      case 'tinta-po':
        obs$ = this.productsService.getProductByCategory('Tinta Pó');
        break;
      case 'diluentes':
        obs$ = this.productsService.getProductByCategory('Diluentes');
        break;
      default:
        obs$ = this.productsService.getAllProducts();
    }
    obs$.subscribe((data: Product[]) => {
      if (filter === 'mais-vendidos') {
        // Usar produtos mais vendidos
        this.produtos = data.slice(0, 4);
        // Se não houver produtos marcados como mais vendidos, pegar os 4 primeiros de todos
        if (this.produtos.length === 0) {
          this.productsService.getAllProducts().subscribe((allProducts) => {
            this.produtos = allProducts.slice(0, 4);
          });
        }
      } else {
        this.produtos = data.slice(0, 4);
      }
    });
  }

  private setupHomeSeo() {
    const routeData = this.route.snapshot.data;
    this.seoService.updateSeoData({
      title: routeData['title'] || 'TPS Tintas Cuiabá - Tintas WEG Industriais e Automotivas | Mato Grosso',
      description: routeData['description'] || 'Revenda autorizada WEG em Cuiabá. Tintas industriais, automotivas e residenciais com cores personalizadas, ferramentas e abrasivos. Atendimento especializado desde 2005.',
      keywords: routeData['keywords'] || 'tintas cuiabá, tintas industriais mato grosso, WEG tintas cuiabá, tintas automotivas, cores personalizadas, ferramentas cuiabá, abrasivos industriais, TPS tintas',
      url: 'https://tpstintas.com.br/',
      type: 'website'
    });
  }

  goToProduct(id: number): void {
    this.router.navigate(['/catalog', id]);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.cartService.openCart();
  }

  getImageSrc(imagem: string): string {
    if (!imagem) return '';
    if (imagem.startsWith('data:')) return imagem;
    if (imagem.startsWith('iVBOR')) return 'data:image/png;base64,' + imagem;
    if (imagem.startsWith('/9j/')) return 'data:image/jpeg;base64,' + imagem;
    if (imagem.startsWith('UklGR')) return 'data:image/webp;base64,' + imagem;
    return 'data:image/png;base64,' + imagem;
  }
}
