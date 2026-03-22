import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../../services/products/products.service';
import { NotificationService } from '../../../services/ui/notification.service';
import { formatCurrencyInput, normalizeCurrencyInput, roundCurrencyValue } from '../../../shareds/price-input.util';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  product: Partial<Product> = {
    codigo: '',
    descricao: '',
    descricao_detalhada: '',
    preco: 0,
    familia_tintas: '',
    linha_produtos_tintas: '',
    conteudo_embalagem: '',
    cor_comercial_tinta: '',
    cor_tinta: '',
    acabamento_pintura: '',
    brilho: '',
    escala_cor: '',
    familia: '',
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
    mais_vendidos: false
  };

  categories: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  brands: string[] = [];

  presetSizes: string[] = [
    '100G', '250G', '500G', '900G',
    '1KG', '3,6KG', '5KG', '18KG',
    '100ML', '200ML', '250ML', '500ML', '900ML',
    '1L', '3,6L', '18L'
  ];

  get allSizes(): string[] {
    const combined = [...this.presetSizes];
    for (const s of this.sizes) {
      if (!combined.includes(s)) combined.push(s);
    }
    return combined;
  }
  loading = false;
  priceInput = '';
  errors: any = {};
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  compressingImage = false;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadFormData();
  }

  onPriceInput(rawValue: string): void {
    const normalized = normalizeCurrencyInput(rawValue);
    this.priceInput = normalized.formatted;
    this.product.preco = normalized.numeric;

    if (this.errors.preco && normalized.numeric >= 0) {
      delete this.errors.preco;
    }
  }

  loadFormData(): void {

    // Carregar categorias
    this.productsService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (error) => console.error('Erro ao carregar categorias:', error)
    });

    // Carregar cores
    this.productsService.getColors().subscribe({
      next: (data) => this.colors = data,
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

    if (!this.product.codigo?.trim()) {
      this.errors.codigo = 'Codigo e obrigatorio';
      isValid = false;
    }

    if (!this.product.descricao?.trim()) {
      this.errors.descricao = 'Descricao e obrigatoria';
      isValid = false;
    }

    if (this.product.preco !== undefined && this.product.preco !== null && this.product.preco < 0) {
      this.errors.preco = 'Preco nao pode ser negativo';
      isValid = false;
    }

    if (this.product.quantidade_por_fardo !== undefined && this.product.quantidade_por_fardo !== null && this.product.quantidade_por_fardo < 1) {
      this.errors.quantidade_por_fardo = 'Quantidade por fardo deve ser maior ou igual a 1';
      isValid = false;
    }

    return isValid;
  }

  // Método para converter campos vazios para null
  private sanitizeProduct(product: any): any {
    const sanitized = { ...product };

    // Lista de campos string que podem ser null
    const stringFields = [
      'familia_tintas', 'linha_produtos_tintas', 'conteudo_embalagem', 'cor_comercial_tinta', 'cor_tinta',
      'acabamento_pintura', 'brilho', 'escala_cor', 'familia', 'versao_tinta', 'funcao_tinta',
      'relacao_resina', 'cura', 'classificacao_verniz', 'massa_especifica', 'tempo_secagem', 'tempo_cura',
      'metodo_aplicacao', 'temperatura_aplicacao', 'ambiente_aplicacao', 'camadas', 'metodo_preparo',
      'processo_pintura', 'photo_url', 'produto_url', 'embalagem', 'referencia_tinta_liquida',
      'sistema_resina', 'cor', 'diluente_etq'
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

    sanitized.preco = roundCurrencyValue(Number(sanitized.preco) || 0);

    return sanitized;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Sanitizar produto antes de enviar
    const productToSend = this.sanitizeProduct(this.product);

    this.productsService.addProduct(productToSend as Product).subscribe({
      next: (newProduct) => {
        this.loading = false;
        // Redirecionar para lista de produtos
        this.router.navigate(['/admin/produtos']);
      },
      error: async (error) => {
        console.error('Erro completo ao adicionar produto:', error);
        console.error('Status do erro:', error.status);
        console.error('Mensagem do erro:', error.message);
        console.error('Body do erro:', error.error);
        this.loading = false;

        // Mostrar erro para o usuário
        await this.notificationService.error('Erro ao adicionar produto: ' + (error.error?.message || error.message || 'Erro desconhecido'));
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
  }

  getFormattedPricePreview(): string {
    return this.priceInput || formatCurrencyInput(this.product.preco) || '0,00';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Verificar tamanho do arquivo
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        // Comprimir a imagem se for maior que 2MB
        this.compressingImage = true;
        this.compressAndConvertImage(file);
      } else {
        // Converter diretamente para base64
        this.convertFileToBuffer(file);
      }

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  convertFileToBuffer(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Obter o resultado em base64
      const base64String = e.target.result;

      // Remover o prefixo "data:image/...;base64," para obter apenas a string base64
      const base64Data = base64String.split(',')[1];

      // Salvar como string base64 para envio à API
      this.product.photo = base64Data;
    };
    reader.readAsDataURL(file);
  }

  compressAndConvertImage(file: File): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Definir dimensões máximas
      const maxWidth = 800;
      const maxHeight = 600;

      let { width, height } = img;

      // Calcular novas dimensões mantendo proporção
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
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const base64String = e.target.result;
            const base64Data = base64String.split(',')[1];
            this.product.photo = base64Data;
            this.compressingImage = false;
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.7); // Qualidade de 70%
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
    this.compressingImage = false;
  }
}
