import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from 'src/app/services/products/products.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { SeoService } from 'src/app/services/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Variável para armazenar os produtos
  public produtos: Product[] = []
  // Variável para armazenar produtos mais vendidos (sempre disponível)
  public produtosMaisVendidos: Product[] = []
  cartService = inject(CartService);

  // Filtro selecionado
  public selectedFilter: string = 'mais-vendidos';
  // Opções de filtro
  public filterOptions = [
    { label: 'Mais vendidos', value: 'mais-vendidos' },
    { label: 'Tinta Líquida', value: 'tinta-liquida' },
    { label: 'Tinta Pó', value: 'tinta-po' },
    { label: 'Diluentes', value: 'diluente' }
  ];

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ){}

  ngOnInit(){
    // Configurar SEO para página inicial
    this.setupHomeSeo();
    this.loadProductsByFilter(this.selectedFilter);
    // Carregar produtos mais vendidos para a seção "Os Mais Vendidos"
    this.loadBestSellers();
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
  }
}
