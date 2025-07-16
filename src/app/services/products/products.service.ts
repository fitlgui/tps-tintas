import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  brand: string;
  size: string;
  descont: number;
  color: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private products: Product[] = [
    { id: 1, name: 'W-THANE PDA 514', price: 132.00, category: 'Agua', brand: 'WEG', size: '1L', descont:15, color:'Vermelha', image: '../../../assets/images/cartShoppingTinta.svg' },
    { id: 2, name: 'W-THANE PDA 515', price: 145.00, category: 'Automovel', brand: 'WMA', size: '1L', descont: 15, color: 'Azul', image: '../../../assets/images/cartShoppingTinta.svg' },
    { id: 3, name: 'W-THANE PDA 516', price: 160.00, category: 'Industria' , brand: 'WEG', size: '1L', descont: 15, color: 'Verde', image: '../../../assets/images/cartShoppingTinta.svg' },
    { id: 4, name: 'W-THANE PDA 517', price: 175.00, category: 'Industria', brand: 'WEG', size: '5L', descont: 15, color: 'Amarelo', image: '../../../assets/images/cartShoppingTinta.svg' },
    { id: 5, name: 'W-THANE PDA 518', price: 190.00, category: 'Automovel', brand: 'WEG', size: '1L', descont: 15, color: 'Preto', image: '../../../assets/images/cartShoppingTinta.svg' },
    { id: 6, name: 'W-THANE PDA 519', price: 205.00, category: 'Agua', brand: 'WEG', size: '2L', descont: 15, color: 'Branco', image: '../../../assets/images/cartShoppingTinta.svg' },
  ];

  constructor() { }

  getProducts(): Observable<Product[]> {
    return of([...this.products]);
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: Math.max(...this.products.map(p => p.id)) + 1
    };
    this.products.push(newProduct);
    return of(newProduct);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...product };
      return of(this.products[index]);
    }
    throw new Error('Produto não encontrado');
  }

  deleteProduct(id: number): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  getProductById(id: number): Observable<Product | null> {
    const product = this.products.find(p => p.id === id);
    return of(product || null);
  }

  getCategories(): Observable<any[]> {
    return of([
      { id: 1, name: 'Agua', qtd: 3 },
      { id: 2, name: 'Automovel', qtd: 5 },
      { id: 3, name: 'Industria', qtd: 2 }
    ]);
  }

  getSize(): Observable<any[]> {
    return of([
      { id: 1, name: '1L' },
      { id: 2, name: '2L' },
      { id: 3, name: '5L' }
    ]);
  }

  getColors(): Observable<any[]> {
      return of([
        { id: 1, name: 'Vermelha', color: '#FF0000' },
        { id: 2, name: 'Azul', color: '#0000FF' },
        { id: 3, name: 'Verde', color: '#00FF00' },
        { id: 4, name: 'Amarela', color: '#FFFF00' },
        { id: 5, name: 'Preto', color: '#000000' },
        { id: 6, name: 'Branco', color: '#FFFFFF' }
      ]);
    }

  getBrands(): Observable<string[]> {
    return of(['WEG', 'WMA', 'TINTA+']);
  }
}
