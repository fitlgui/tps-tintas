import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public produtos: any[] = []

  constructor(private readonly productsService: ProductsService){}

  ngOnInit(){

    // Obtendo Produtos do Serviço
    this.productsService.getProducts().subscribe((data: any[])=> {
      this.produtos = data.slice(0, 4); // Limitando a 4 produtos para a exibição inicial
    })
  }
}
