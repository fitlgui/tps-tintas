import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, catchError } from 'rxjs';
import { environment } from 'src/environment/enviroment';

// Modelo de Produto
export interface Product {
    id: number;
    codigo: string;
    descricao: string;
    cor_tinta: string;
    acabamento_pintura: string;
    brilho: string;
    cor_comercial_tinta: string;
    escala_cor: string;
    conteudo_embalagem: string;
    familia_tintas: string;
    familia: string;
    linha_produtos_tintas: string;
    versao_tinta: string;
    funcao_tinta: string;
    relacao_resina: string;
    cura: string;
    classificacao_verniz: string;
    massa_especifica: string;
    tempo_secagem: string;
    tempo_cura: string;
    metodo_aplicacao: string;
    temperatura_aplicacao: string;
    ambiente_aplicacao: string;
    camadas: string;
    metodo_preparo: string;
    processo_pintura: string;
    photo: string; // String base64 da imagem
    photo_url: string;
    produto_url: string;
    embalagem: string;
    referencia_tinta_liquida: string;
    sistema_resina: string;
    quantidade_por_fardo: number;
    cor: string;
    diluente_etq: string;
    preco: number;
    createdAt: string;
    updatedAt: string;
}
export interface ProductUpdate {
    codigo: string;
    descricao: string;
    cor_tinta: string;
    acabamento_pintura: string;
    brilho: string;
    cor_comercial_tinta: string;
    escala_cor: string;
    conteudo_embalagem: string;
    familia_tintas: string;
    familia: string;
    linha_produtos_tintas: string;
    versao_tinta: string;
    funcao_tinta: string;
    relacao_resina: string;
    cura: string;
    classificacao_verniz: string;
    massa_especifica: string;
    tempo_secagem: string;
    tempo_cura: string;
    metodo_aplicacao: string;
    temperatura_aplicacao: string;
    ambiente_aplicacao: string;
    camadas: string;
    metodo_preparo: string;
    processo_pintura: string;
    photo: string; // String base64 da imagem
    photo_url: string;
    produto_url: string;
    embalagem: string;
    referencia_tinta_liquida: string;
    sistema_resina: string;
    quantidade_por_fardo: number;
    cor: string;
    diluente_etq: string;
    preco: number;
}


@Injectable({
  providedIn: 'root'
})

export class ProductsService {
  
  // Variavel de ambiente
  private environment = environment;

  constructor(private readonly http: HttpClient) { }

  // Função para converter buffer em data URL
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

  // Função para obter a URL da imagem do produto
  getProductImageUrl(product: Product): string {
    // Se photo é uma string base64, usar diretamente
    if (product.photo && typeof product.photo === 'string') {
      // Se já tem o prefixo data:image, usar diretamente
      if (product.photo.startsWith('data:image/')) {
        return product.photo;
      }
      // Se é apenas a string base64, adicionar o prefixo
      return `data:image/jpeg;base64,${product.photo}`;
    }

    // Tentar converter o buffer (quando vem do GET da API)
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

  // Processar produtos vindos da API (converter buffer para string base64 se necessário)
  private processProductsImages(products: Product[]): Product[] {
    return products.map(product => {
      // Se photo é um buffer, converter para string base64
      if (product.photo && typeof product.photo === 'object') {
        const dataUrl = this.bufferToDataUrl(product.photo);
        if (dataUrl) {
          // Extrair apenas a parte base64 (sem o prefixo data:image...)
          const base64Data = dataUrl.split(',')[1];
          product.photo = base64Data;
        }
      }
      return product;
    });
  }

  getAllProducts(): Observable<Product[]> {
    // Pegar produtos do banco de dados
    return this.http.get<any>(`${this.environment.apiUrl}/products?limit=1210&page=1`).pipe(
      map((data) => {
        // Handle different API response structures
        let products: any[] = [];
        
        if (Array.isArray(data)) {
          products = data;
        } else if (data && Array.isArray(data.items)) {
          products = data.items;
        } else if (data && Array.isArray(data.products)) {
          products = data.products;
        } else if (data && data.data && Array.isArray(data.data)) {
          products = data.data;
        } else {
          console.warn('API response structure not recognized:', data);
          products = [];
        }
        
        return this.processProductsImages(products);
      }),
      catchError((error: any) => {
        console.error('Erro ao buscar produtos:', error);
        return of([]);
      })
    );
  }

  // Pegar produtos do banco de dados
  getProducts(page: string): Observable<Product[]> {
    return this.http.get<any>(`${this.environment.apiUrl}/products?limit=10&page=${page}`).pipe(
      map((data) => {
        console.log(data.items);
        const products = data.items;
        return this.processProductsImages(products);
      })
    );
  }

  getProductByName(name: string): Observable<Product | null> {
    if (!name) {
      return of(null);
    }

    const products = this.getAllProducts().pipe(
      map(products => {
        const product = products.find(p => p.descricao.toLowerCase().includes(name.toLowerCase()));
        return product || null;
      })
    );
    return products;
  }

  getProductByCategory(category: string): Observable<Product[]> {
    if (!category || category === 'all') {
      return this.getAllProducts();
    }

    return this.getAllProducts().pipe(
      map(products => products.filter(product => product.familia_tintas === category))
    );
  }

  // Pegar produto por ID
  getProductById(id: number): Observable<Product | null> {
    return this.http.get<Product | null>(`${this.environment.apiUrl}/products/${id}`).pipe(
      map((data: Product | null) => {
        console.log(data);
        if (data) {
          // Se photo é um buffer, converter para string base64
          if (data.photo && typeof data.photo === 'object') {
            const dataUrl = this.bufferToDataUrl(data.photo);
            if (dataUrl) {
              // Extrair apenas a parte base64 (sem o prefixo data:image...)
              const base64Data = dataUrl.split(',')[1];
              data.photo = base64Data;
            }
          }
        }
        return data;
      })
    );
  }

  // Criar rota de adicionar produto
  addProduct(product: Product): Observable<any> {
    console.log('addProduct chamado no service com:', product);
    
    // Remover campos que não devem ser enviados na criação e garantir que photo seja string base64
    const { id, createdAt, updatedAt, ...productToSend } = product;
    
    console.log('Produto após remoção de campos:', productToSend);
    
    if (productToSend.photo && typeof productToSend.photo === 'string' && productToSend.photo.startsWith('data:image/')) {
      // Extrair apenas a parte base64
      productToSend.photo = productToSend.photo.split(',')[1];
      console.log('Photo processado (prefixo removido)');
    }
    
    console.log('Enviando para API:', `${this.environment.apiUrl}/products`);
    console.log('Dados finais:', productToSend);
    
    return this.http.post<Product>(`${this.environment.apiUrl}/products`, productToSend);
  }

  // Criar rota de atualizar produto
  updateProduct(id: number, product: ProductUpdate): Observable<ProductUpdate> {
    // Garantir que photo seja enviado como string base64 (sem prefixo data:image)
    const productToSend = { ...product };
    if (productToSend.photo && typeof productToSend.photo === 'string' && productToSend.photo.startsWith('data:image/')) {
      // Extrair apenas a parte base64
      productToSend.photo = productToSend.photo.split(',')[1];
    }
    // Note: ProductUpdate já não inclui id, createdAt, updatedAt por definição da interface
    return this.http.patch<ProductUpdate>(`${this.environment.apiUrl}/products/${id}`, productToSend);
  }

  // Criar rota de deletar produto
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.environment.apiUrl}/products/${id}`).pipe(
      map(() => true)
    );
  }

  // Pegar categorias
  getCategories(): Observable<any[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const categories = products.map(product => product.familia_tintas);
        let allCategories: string[] = []
        for(let i = 0; i < categories.length; i++) {
          if (categories[i] && !allCategories.includes(categories[i])) {
            if(categories[i] !== 'undefined' && categories[i] !== null) {
              allCategories.push(categories[i]);
            }
          }
          
        }
        console.log('Categorias:', allCategories);
        return allCategories;
      })
    );
  }

  // Pegar tamanhos
  getSize(): Observable<any[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const sizes = products.map(product => product.conteudo_embalagem);
        let allSizes: string[] = [];
        for(let i = 0; i < sizes.length; i++) {
          if (sizes[i] && !allSizes.includes(sizes[i])) {
            if(sizes[i] !== 'undefined' && sizes[i] !== null && sizes[i] !== '-' && sizes[i] !== '') {
              allSizes.push(sizes[i]);
            }
          }
          
        }
        console.log('Tamanhos:', allSizes);
        return allSizes;
      })
    )
  }


  // pegar cores
  getColors(): Observable<any[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const colors = products.map(product => product.cor_comercial_tinta);
        let allColors: string[] = [];
        for(let i = 0; i < colors.length; i++) {
          if (colors[i] && !allColors.includes(colors[i])) {
            if(colors[i] !== 'undefined' && colors[i] !== null) {
              allColors.push(colors[i]);
            }
          }
          
        }
        console.log('Cores:', allColors);
        return allColors;
      })
    );
 }

 getCountAllProducts(): Observable<number> {
    return this.http.get<number>(`${this.environment.apiUrl}/products/count`);
  }

  // Obter estatísticas por categoria
  getProductsByCategory(): Observable<{category: string, count: number}[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const categoryMap = new Map<string, number>();
        
        products.forEach(product => {
          const category = product.familia_tintas || 'Não categorizado';
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });
        
        return Array.from(categoryMap.entries()).map(([category, count]) => ({
          category,
          count
        })).sort((a, b) => b.count - a.count);
      })
    );
  }

  // Obter estatísticas por marca/linha
  getProductsByBrand(): Observable<{brand: string, count: number}[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const brandMap = new Map<string, number>();
        
        products.forEach(product => {
          const brand = product.linha_produtos_tintas || 'Sem marca';
          brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
        });
        
        return Array.from(brandMap.entries()).map(([brand, count]) => ({
          brand,
          count
        })).sort((a, b) => b.count - a.count);
      })
    );
  }

  // Obter estatísticas gerais do dashboard
  getDashboardStats(): Observable<{
    totalProducts: number,
    totalCategories: number,
    totalBrands: number,
    totalColors: number
  }> {
    return this.getAllProducts().pipe(
      map(products => {
        const categories = new Set(products.map(p => p.familia_tintas).filter(Boolean));
        const brands = new Set(products.map(p => p.linha_produtos_tintas).filter(Boolean));
        const colors = new Set(products.map(p => p.cor_comercial_tinta).filter(Boolean));
        
        return {
          totalProducts: products.length,
          totalCategories: categories.size,
          totalBrands: brands.size,
          totalColors: colors.size
        };
      })
    );
  }}
