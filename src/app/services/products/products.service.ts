import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  getProducts(): Observable<any[]> {
    return of([
      { id: 1, name: 'W-THANE PDA 514', price: 132.00, descont:15, image: '../../../assets/images/cartShoppingTinta.svg' },
      { id: 2, name: 'W-THANE PDA 515', price: 145.00, descont: 15, image: '../../../assets/images/cartShoppingTinta.svg' },
      { id: 3, name: 'W-THANE PDA 516', price: 160.00, descont: 15, image: '../../../assets/images/cartShoppingTinta.svg' },
      { id: 4, name: 'W-THANE PDA 517', price: 175.00, descont: 15, image: '../../../assets/images/cartShoppingTinta.svg' }
    ]);
  }
}
