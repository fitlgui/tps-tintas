import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../../../services/products/products.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  product: Partial<Product> = {
    codigo: '',
    descricao: '',
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
    diluente_etq: ''
  };

  categories: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  brands: string[] = [];
  loading = false;
  errors: any = {};
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  compressingImage = false;

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFormData();
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
    console.log('Iniciando validação do formulário...');
    this.errors = {};
    let isValid = true;

    if (!this.product.codigo?.trim()) {
      this.errors.codigo = 'Código é obrigatório';
      console.log('Erro: Código não preenchido');
      isValid = false;
    }

    if (!this.product.descricao?.trim()) {
      this.errors.descricao = 'Descrição é obrigatória';
      console.log('Erro: Descrição não preenchida');
      isValid = false;
    }

    if (!this.product.preco || this.product.preco <= 0) {
      this.errors.preco = 'Preço deve ser maior que zero';
      console.log('Erro: Preço inválido:', this.product.preco);
      isValid = false;
    }

    if (!this.product.familia_tintas) {
      this.errors.familia_tintas = 'Família de tintas é obrigatória';
      console.log('Erro: Família de tintas não selecionada');
      isValid = false;
    }

    if (!this.product.conteudo_embalagem) {
      this.errors.conteudo_embalagem = 'Conteúdo da embalagem é obrigatório';
      console.log('Erro: Conteúdo da embalagem não preenchido');
      isValid = false;
    }

    if (!this.product.cor_comercial_tinta) {
      this.errors.cor_comercial_tinta = 'Cor comercial é obrigatória';
      console.log('Erro: Cor comercial não preenchida');
      isValid = false;
    }

    console.log('Resultado da validação:', isValid ? 'VÁLIDO' : 'INVÁLIDO');
    console.log('Erros encontrados:', this.errors);
    
    return isValid;
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
    console.log('onSubmit chamado');
    console.log('Produto antes da validação:', this.product);
    
    if (!this.validateForm()) {
      console.log('Validação falhou, erros:', this.errors);
      return;
    }

    console.log('Validação passou, iniciando envio...');
    this.loading = true;

    // Sanitizar produto antes de enviar
    const productToSend = this.sanitizeProduct(this.product);
    console.log('Produto sanitizado a ser enviado:', productToSend);

    this.productsService.addProduct(productToSend as Product).subscribe({
      next: (newProduct) => {
        console.log('Produto adicionado com sucesso:', newProduct);
        this.loading = false;
        // Redirecionar para lista de produtos
        this.router.navigate(['/admin/produtos']);
      },
      error: (error) => {
        console.error('Erro completo ao adicionar produto:', error);
        console.error('Status do erro:', error.status);
        console.error('Mensagem do erro:', error.message);
        console.error('Body do erro:', error.error);
        this.loading = false;
        
        // Mostrar erro para o usuário
        alert('Erro ao adicionar produto: ' + (error.error?.message || error.message || 'Erro desconhecido'));
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
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
