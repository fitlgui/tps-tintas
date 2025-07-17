import { Injectable, signal } from '@angular/core';
import { Product } from '../products/products.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'shopping_cart';

  // Signals para reatividade
  cartItems = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  constructor() {
    this.loadCartFromStorage();
  }

  // Carregar carrinho do localStorage
  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        this.cartItems.set(items);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }

  // Salvar carrinho no localStorage
  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  // Adicionar produto ao carrinho
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      // Se já existe, aumenta a quantidade
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      // Se não existe, adiciona novo item
      this.cartItems.set([...currentItems, { product, quantity }]);
    }

    this.saveCartToStorage();
  }

  // Remover produto do carrinho
  removeFromCart(productId: number): void {
    const updatedItems = this.cartItems().filter(item => item.product.id !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  // Atualizar quantidade de um produto
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );

    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  // Limpar carrinho
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  // Abrir/fechar carrinho
  toggleCart(): void {
    this.isCartOpen.set(!this.isCartOpen());
  }

  openCart(): void {
    this.isCartOpen.set(true);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  // Calcular total de itens
  getTotalItems(): number {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  }

  // Calcular total do carrinho
  getTotalPrice(): number {
    return this.cartItems().reduce((total, item) => {
      const finalPrice = item.product.descont > 0
        ? item.product.price - (item.product.price * item.product.descont / 100)
        : item.product.price;
      return total + (finalPrice * item.quantity);
    }, 0);
  }

  // Gerar mensagem para WhatsApp
  generateWhatsAppMessage(): string {
    const items = this.cartItems();
    if (items.length === 0) {
      return '';
    }

    let message = '*🛒 Pedido do Carrinho de Compras*\n\n';

    items.forEach((item, index) => {
      const finalPrice = item.product.descont > 0
        ? item.product.price - (item.product.price * item.product.descont / 100)
        : item.product.price;

      message += `*${index + 1}. ${item.product.name}*\n`;
      message += `   • Quantidade: ${item.quantity}\n`;
      message += `   • Preço unitário: R$ ${finalPrice.toFixed(2)}\n`;
      message += `   • Subtotal: R$ ${(finalPrice * item.quantity).toFixed(2)}\n\n`;
    });

    message += `*💰 Total do Pedido: R$ ${this.getTotalPrice().toFixed(2)}*\n\n`;
    message += `Gostaria de finalizar este pedido. Aguardo contato para confirmação! 😊`;

    return encodeURIComponent(message);
  }

  // Abrir WhatsApp com a mensagem
  sendToWhatsApp(phoneNumber: string = '5565993421407'): void {
    const message = this.generateWhatsAppMessage();
    if (message) {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  }
}
