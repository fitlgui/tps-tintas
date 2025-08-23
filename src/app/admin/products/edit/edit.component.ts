import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../../../services/products/products.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  productId!: number;
  product: Product = {
    id: 0,
    codigo: '',
    descricao: '',
    cor_tinta: '',
    acabamento_pintura: '',
    brilho: '',
    cor_comercial_tinta: '',
    escala_cor: '',
    conteudo_embalagem: '',
    familia_tintas: '',
    familia: '',
    linha_produtos_tintas: '',
    versao_tinta: '',
    funcao_tinta: '',
    relacao_resina: '',
    cura: '',
    classificacao_verniz: '',
    massa_especifica: '',
    tempo_secagem: '',
    tempo_cura: '',
    metodo_aplicacao: '',
    temperatura_aplicacao: '',
    ambiente_aplicacao: '',
    camadas: '',
    metodo_preparo: '',
    processo_pintura: '',
    photo: '',
    photo_url: '',
    produto_url: '',
    embalagem: '',
    referencia_tinta_liquida: '',
    sistema_resina: '',
    quantidade_por_fardo: 1,
    cor: '',
    diluente_etq: '',
    preco: 0,
    mais_vendidos: false,
    createdAt: '',
    updatedAt: ''
}

  originalProduct: Product | null = null;
  categories: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  brands: string[] = [];
  loading = false;
  loadingProduct = true;
  errors: any = {};
  productNotFound = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    // Obter ID da rota
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct();
        this.loadFormData();
      } else {
        this.productNotFound = true;
        this.loadingProduct = false;
      }
    });
  }

  loadProduct(): void {
    this.loadingProduct = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = { ...product };
          this.originalProduct = { ...product };
          this.productNotFound = false;
        } else {
          this.productNotFound = true;
        }
        this.loadingProduct = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.productNotFound = true;
        this.loadingProduct = false;
      }
    });
  }

  loadFormData(): void {
    // Carregar categorias
    this.productsService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (error) => console.error('Erro ao carregar categorias:', error)
    });

    // Carregar cores
    this.productsService.getColors().subscribe({
      next: (data) => {
        this.colors = data;
      },
      error: (error) => console.error('Erro ao carregar cores:', error)
    });

    // Carregar tamanhos
    this.productsService.getSize().subscribe({
      next: (data) => this.sizes = data,
      error: (error) => console.error('Erro ao carregar tamanhos:', error)
    });
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.product.descricao.trim()) {
      this.errors.descricao = 'Nome é obrigatório';
      isValid = false;
    }

    if (this.product.preco <= 0) {
      this.errors.preco = 'Preço deve ser maior que zero';
      isValid = false;
    }

    if (!this.product.familia_tintas) {
      this.errors.familia_tintas = 'Categoria é obrigatória';
      isValid = false;
    }

    if (!this.product.conteudo_embalagem) {
      this.errors.conteudo_embalagem = 'Tamanho é obrigatório';
      isValid = false;
    }

    if (!this.product.cor_tinta) {
      this.errors.cor_tinta = 'Cor é obrigatória';
      isValid = false;
    }

    return isValid;
  }

  hasChanges(): boolean {
    if (!this.originalProduct) return false;

    return JSON.stringify(this.product) !== JSON.stringify(this.originalProduct);
  }

  // Método para converter campos vazios para null
  private sanitizeProduct(product: any): any {
    const sanitized = { ...product };
    
    // Lista de campos string que podem ser null
    const stringFields = [
      'linha_produtos_tintas', 'cor_tinta', 'acabamento_pintura', 'brilho', 'escala_cor',
      'familia', 'versao_tinta', 'funcao_tinta', 'relacao_resina', 'cura', 'classificacao_verniz',
      'massa_especifica', 'tempo_secagem', 'tempo_cura', 'metodo_aplicacao', 'temperatura_aplicacao',
      'ambiente_aplicacao', 'camadas', 'metodo_preparo', 'processo_pintura', 'photo_url',
      'produto_url', 'embalagem', 'referencia_tinta_liquida', 'sistema_resina', 'cor', 'diluente_etq'
    ];

    // Converter strings vazias para null
    stringFields.forEach(field => {
      if (sanitized[field] === '' || sanitized[field] === undefined) {
        sanitized[field] = null;
      }
    });

    // Campos numéricos que devem ter valores mínimos
    if (sanitized.quantidade_por_fardo === '' || sanitized.quantidade_por_fardo === undefined || sanitized.quantidade_por_fardo === null || sanitized.quantidade_por_fardo < 1) {
      sanitized.quantidade_por_fardo = 1;
    }

    return sanitized;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Criar um objeto sem os campos id, createdAt e updatedAt, e sanitizar
    const { id, createdAt, updatedAt, ...productData } = this.product;
    const productToUpdate = this.sanitizeProduct(productData);

    this.productsService.updateProduct(this.productId, productToUpdate).subscribe({
      next: (updatedProduct) => {
        this.loading = false;
        // Redirecionar para lista de produtos
        this.router.navigate(['/admin/produtos']);
      },
      error: (error) => {
        console.error('Erro ao atualizar produto:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
  }

  resetForm(): void {
    if (this.originalProduct) {
      this.product = { ...this.originalProduct };
      this.errors = {};
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande! Máximo permitido: 2MB');
        return;
      }

      this.selectedFile = file;
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Comprimir e converter para base64
      this.compressAndConvertImage(file);
    }
  }

  compressAndConvertImage(file: File): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Definir tamanho máximo para compressão
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      
      // Calcular novo tamanho mantendo proporção
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para base64 com qualidade reduzida
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% de qualidade
      
      // Remover prefixo e salvar
      const base64Data = compressedBase64.split(',')[1];
      this.product.photo = base64Data;
    };

    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e: any) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.product.photo = '';
  }

  // Método para obter URL da imagem do produto
  getProductImageUrl(product: Product | null): string {
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
