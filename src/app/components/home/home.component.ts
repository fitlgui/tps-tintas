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

  public produtos: Product[] = []
  cartService = inject(CartService);

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ){}

  ngOnInit(){
    // Configurar SEO para página inicial
    this.setupHomeSeo();

    // Obtendo Produtos do Serviço
    this.productsService.getAllProducts().subscribe((data: Product[])=> {
      for(let x = 0; x < data.length && this.produtos.length < 4; x++) {
        if(data[x].quantidade_por_fardo >= 1 && data[x].preco > 0) {
          this.produtos.push(data[x]);
        }
      }
    })
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
    console.log('Produto adicionado ao carrinho:', product.descricao);
  }
}
