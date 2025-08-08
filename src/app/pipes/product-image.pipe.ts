import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../services/products/products.service';

@Pipe({
  name: 'productImage'
})
export class ProductImagePipe implements PipeTransform {

  transform(product: Product | null): string {
    if (!product) {
      return 'assets/images/cartShoppingTinta.svg';
    }

    // Verificar se photo é uma string base64
    if (product.photo && typeof product.photo === 'string') {
      // Se já tem o prefixo data:image, usar diretamente
      if (product.photo.startsWith('data:image/')) {
        return product.photo;
      }
      // Se é apenas a string base64, adicionar o prefixo
      return `data:image/jpeg;base64,${product.photo}`;
    }

    // Tentar converter o buffer (para compatibilidade com dados antigos)
    if (product.photo && typeof product.photo === 'object') {
      const dataUrl = this.bufferToDataUrl(product.photo);
      if (dataUrl) {
        return dataUrl;
      }
    }
    
    // Usar photo_url como fallback
    if (product.photo_url) {
      return product.photo_url;
    }
    
    // Imagem padrão se não houver nenhuma
    return 'assets/images/cartShoppingTinta.svg';
  }

  private bufferToDataUrl(buffer: any): string | null {
    if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
      return null;
    }
    
    try {
      // Converter array de bytes para Uint8Array
      const uint8Array = new Uint8Array(buffer.data);
      
      // Converter para base64
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      // Assumir formato JPEG por padrão, pode ser ajustado conforme necessário
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Erro ao converter buffer para data URL:', error);
      return null;
    }
  }
}
