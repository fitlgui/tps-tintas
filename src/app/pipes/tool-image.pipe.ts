import { Pipe, PipeTransform } from '@angular/core';
import { Tool } from '../services/tools/tools.service';

@Pipe({
  name: 'toolImage'
})
export class ToolImagePipe implements PipeTransform {

  transform(tool: Tool | null): string {
    if (!tool) {
      return 'assets/images/cartShoppingTinta.svg';
    }

    // Verificar se photo é uma string base64
    if (tool.photo && typeof tool.photo === 'string') {
      // Se já tem o prefixo data:image, usar diretamente
      if (tool.photo.startsWith('data:image/')) {
        return tool.photo;
      }
      // Se é apenas a string base64, adicionar o prefixo
      return `data:image/jpeg;base64,${tool.photo}`;
    }

    // Tentar converter o buffer (para compatibilidade com dados antigos)
    if (tool.photo && typeof tool.photo === 'object') {
      const dataUrl = this.bufferToDataUrl(tool.photo);
      if (dataUrl) {
        return dataUrl;
      }
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
      
      // Assumir formato JPEG por padrão
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Erro ao converter buffer para data URL:', error);
      return null;
    }
  }
}
