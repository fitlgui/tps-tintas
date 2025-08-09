import { Injectable, signal } from '@angular/core';
import { Product } from '../products/products.service';
import { Tool } from '../tools/tools.service';

export interface CartItem {
  product?: Product;
  tool?: Tool;
  quantity: number;
  type: 'product' | 'tool';
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
    const existingItemIndex = currentItems.findIndex(item => 
      item.type === 'product' && item.product?.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Se já existe, aumenta a quantidade
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      // Se não existe, adiciona novo item
      this.cartItems.set([...currentItems, { product, quantity, type: 'product' }]);
    }

    this.saveCartToStorage();
  }

  // Adicionar ferramenta ao carrinho
  addToolToCart(tool: Tool, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(item => 
      item.type === 'tool' && item.tool?.id === tool.id
    );

    if (existingItemIndex >= 0) {
      // Se já existe, aumenta a quantidade
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      // Se não existe, adiciona novo item
      this.cartItems.set([...currentItems, { tool, quantity, type: 'tool' }]);
    }

    this.saveCartToStorage();
  }

  // Remover produto do carrinho
  removeFromCart(itemId: number, type: 'product' | 'tool'): void {
    const updatedItems = this.cartItems().filter(item => {
      if (type === 'product') {
        return !(item.type === 'product' && item.product?.id === itemId);
      } else {
        return !(item.type === 'tool' && item.tool?.id === itemId);
      }
    });
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  // Atualizar quantidade de um produto
  updateQuantity(itemId: number, quantity: number, type: 'product' | 'tool'): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId, type);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item => {
      if (type === 'product' && item.type === 'product' && item.product?.id === itemId) {
        return { ...item, quantity };
      } else if (type === 'tool' && item.type === 'tool' && item.tool?.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });

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
      let finalPrice = 0;
      if (item.type === 'product' && item.product) {
        finalPrice = item.product.preco;
      } else if (item.type === 'tool' && item.tool) {
        finalPrice = item.tool.preco;
      }
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
      let finalPrice = 0;
      let itemName = '';
      let itemType = '';

      if (item.type === 'product' && item.product) {
        finalPrice = item.product.preco;
        itemName = item.product.descricao;
        itemType = '🎨 Tinta';
      } else if (item.type === 'tool' && item.tool) {
        finalPrice = item.tool.preco;
        itemName = item.tool.nome;
        itemType = '🔧 Ferramenta';
      }

      if (itemName && finalPrice > 0) {
        message += `*${index + 1}. ${itemType}: ${itemName}*\n`;
        message += `   • Quantidade: ${item.quantity}\n`;
        message += `   • Preço unitário: R$ ${finalPrice}\n`;
        message += `   • Subtotal: R$ ${(finalPrice * item.quantity)}\n\n`;
      }
    });

    message += `*💰 Total do Pedido: R$ ${this.getTotalPrice()}*\n\n`;
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
