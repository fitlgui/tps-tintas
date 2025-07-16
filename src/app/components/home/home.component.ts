import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from 'src/app/services/products/products.service';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public produtos: any[] = []
  cartService = inject(CartService);

  constructor(private readonly productsService: ProductsService, private readonly router: Router){}

  ngOnInit(){

    // Obtendo Produtos do Serviço
    this.productsService.getProducts().subscribe((data: any[])=> {
      this.produtos = data.slice(0, 4); // Limitando a 4 produtos para a exibição inicial
    })
  }

  goToProduct(id: number): void {
    this.router.navigate(['/catalog', id]);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    console.log('Produto adicionado ao carrinho:', product.name);
  }
}
