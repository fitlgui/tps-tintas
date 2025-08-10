import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../services/products/products.service';
import { Tool } from '../../services/tools/tools.service';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss']
})
export class ShoppingComponent {
  cartService = inject(CartService);

  // Número do WhatsApp da empresa (substitua pelo número real)
  private readonly whatsappNumber = '5565993421407';

  // Atualizar quantidade de um item
  updateQuantity(itemId: number, quantity: number, type: 'product' | 'tool'): void {
    this.cartService.updateQuantity(itemId, quantity, type);
  }

  // Remover item do carrinho
  removeItem(itemId: number, type: 'product' | 'tool'): void {
    this.cartService.removeFromCart(itemId, type);
  }

  // Limpar todo o carrinho
  clearCart(): void {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.cartService.clearCart();
    }
  }

  // Obter preço final do item
  getFinalPrice(item: Product | Tool): any {
    if(item.preco > 0) {
      return item.preco;
    } else {
      return 'Falar com Vendedor';
    }
  }

  // Obter nome do item
  getItemName(item: Product | Tool): string {
    return 'nome' in item ? item.nome : item.descricao;
  }

  // Obter ID do item
  getItemId(item: Product | Tool): number {
    return item.id!;
  }

  // Enviar para WhatsApp
  sendToWhatsApp(): void {
    this.cartService.sendToWhatsApp(this.whatsappNumber);
  }
}
