import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../services/products/products.service';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss']
})
export class ShoppingComponent {
  cartService = inject(CartService);

  // Número do WhatsApp da empresa (substitua pelo número real)
  private readonly whatsappNumber = '5565993421407';

  // Calcular preço final com desconto
  getFinalPrice(product: Product): number {
    if (product.descont > 0) {
      return product.price - (product.price * product.descont / 100);
    }
    return product.price;
  }

  // Atualizar quantidade de um item
  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  // Remover item do carrinho
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  // Limpar todo o carrinho
  clearCart(): void {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.cartService.clearCart();
    }
  }

  // Enviar para WhatsApp
  sendToWhatsApp(): void {
    this.cartService.sendToWhatsApp(this.whatsappNumber);
  }
}
