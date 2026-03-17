import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToolsService, CreateToolRequest } from 'src/app/services/tools/tools.service';
import { AuthService } from 'src/app/services/admin/admin.service';
import { NotificationService } from 'src/app/services/ui/notification.service';
import { formatCurrencyInput, normalizeCurrencyInput, roundCurrencyValue } from '../../../shareds/price-input.util';

@Component({
  selector: 'app-add-tool',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddToolComponent {
  toolForm!: FormGroup;
  loading = false;
  error: string | null = null;
  priceInput = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  compressingImage = false;

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Verificar permissões ao inicializar
    if (!this.authService.canEdit()) {
      this.router.navigate(['/admin/tools']);
      return;
    }

    this.toolForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      preco: [0, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      info_tecnica: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
      marca: ['', [Validators.maxLength(50)]],
      categoria: ['', [Validators.maxLength(50)]],
      photo: [''] // Campo para imagem
    });
  }

  onSubmit(): void {
    if (this.toolForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;

      const normalizedPrice = roundCurrencyValue(Number(this.toolForm.getRawValue().preco) || 0);
      this.toolForm.patchValue({ preco: normalizedPrice }, { emitEvent: false });

      const toolData: CreateToolRequest = {
        nome: this.toolForm.value.nome.trim(),
        preco: normalizedPrice,
        descricao: this.toolForm.value.descricao.trim(),
        info_tecnica: this.toolForm.value.info_tecnica.trim(),
        marca: this.toolForm.value.marca?.trim() || undefined,
        categoria: this.toolForm.value.categoria?.trim() || undefined,
        photo: this.toolForm.value.photo || undefined // Incluir foto se houver
      };

      this.toolsService.createTool(toolData).subscribe({
        next: async () => {
          await this.notificationService.success('Ferramenta criada com sucesso!');
          this.router.navigate(['/admin/tools']);
        },
        error: (error) => {
          this.error = 'Erro ao criar ferramenta: ' + error.message;
          this.loading = false;
          console.error('Erro ao criar ferramenta:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.toolForm.controls).forEach(key => {
      const control = this.toolForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/tools']);
  }

  // Getters para validação
  get nome() { return this.toolForm.get('nome'); }
  get preco() { return this.toolForm.get('preco'); }
  get descricao() { return this.toolForm.get('descricao'); }
  get info_tecnica() { return this.toolForm.get('info_tecnica'); }
  get marca() { return this.toolForm.get('marca'); }
  get categoria() { return this.toolForm.get('categoria'); }

  // Métodos de validação
  isFieldInvalid(fieldName: string): boolean {
    const field = this.toolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.toolForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} deve ser maior que ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} deve ser menor que ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      preco: 'Preço',
      descricao: 'Descrição',
      info_tecnica: 'Informações Técnicas',
      marca: 'Marca',
      categoria: 'Categoria'
    };
    return labels[fieldName] || fieldName;
  }

  onPriceInput(rawValue: string): void {
    const normalized = normalizeCurrencyInput(rawValue);
    this.priceInput = normalized.formatted;
    this.toolForm.patchValue({ preco: normalized.numeric }, { emitEvent: false });
    this.preco?.markAsDirty();
    this.preco?.markAsTouched();
    this.preco?.updateValueAndValidity({ emitEvent: false });
  }

  getFormattedPricePreview(): string {
    return this.priceInput || formatCurrencyInput(Number(this.preco?.value) || 0) || '0,00';
  }

  // Métodos para manipulação de imagens
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
      this.toolForm.patchValue({ photo: base64Data });
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
            this.toolForm.patchValue({ photo: base64Data });
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
    this.toolForm.patchValue({ photo: '' });
    this.compressingImage = false;
  }
}
