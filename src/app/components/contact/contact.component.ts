import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  // Número do WhatsApp da empresa
  private readonly whatsappNumber = '5565993421407';

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  // Máscara para telefone
  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1');
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
      } else if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    }
    
    event.target.value = value;
    this.contactForm.patchValue({ phone: value });
  }

  // Verificar se um campo específico tem erro
  hasError(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Obter mensagem de erro específica
  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${this.getFieldName(field)} é obrigatório`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['minlength']) return `${this.getFieldName(field)} muito curto`;
      if (control.errors['pattern']) return 'Formato de telefone inválido. Use: (11) 99999-9999';
    }
    return '';
  }

  // Obter nome amigável do campo
  private getFieldName(field: string): string {
    const names: { [key: string]: string } = {
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      subject: 'Assunto',
      message: 'Mensagem'
    };
    return names[field] || field;
  }

  // Gerar mensagem formatada para WhatsApp
  private generateWhatsAppMessage(): string {
    const formData = this.contactForm.value;
    
    let message = '*📝 Contato via Site - TPS Tintas*\n\n';
    message += `*Nome:* ${formData.name}\n`;
    message += `*Email:* ${formData.email}\n`;
    
    if (formData.phone) {
      message += `*Telefone:* ${formData.phone}\n`;
    }
    
    message += `*Assunto:* ${this.getSubjectLabel(formData.subject)}\n\n`;
    message += `*Mensagem:*\n${formData.message}\n\n`;
    message += `_Mensagem enviada através do formulário de contato do site._`;
    
    return encodeURIComponent(message);
  }

  // Obter label do assunto
  private getSubjectLabel(value: string): string {
    const subjects: { [key: string]: string } = {
      duvida: 'Dúvida sobre Produto',
      pedido: 'Informações sobre Pedido',
      suporte: 'Suporte Técnico',
      parceria: 'Parceria Comercial',
      outro: 'Outro'
    };
    return subjects[value] || value;
  }

  // Enviar formulário
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Simular processamento
      setTimeout(() => {
        // Gerar mensagem e abrir WhatsApp
        const message = this.generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${message}`;
        
        // Abrir WhatsApp em nova aba
        window.open(whatsappUrl, '_blank');
        
        // Mostrar sucesso
        this.submitSuccess = true;
        this.isSubmitting = false;
        
        // Resetar formulário após 3 segundos
        setTimeout(() => {
          this.contactForm.reset();
          this.submitSuccess = false;
        }, 3000);
        
      }, 1000);
    } else {
      // Marcar todos os campos como tocados para mostrar erros
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  // Contatos diretos
  openWhatsApp(): void {
    const message = encodeURIComponent('Olá! Gostaria de entrar em contato com vocês.');
    window.open(`https://wa.me/${this.whatsappNumber}?text=${message}`, '_blank');
  }

  openEmail(): void {
    window.location.href = 'mailto:contato@tpstintas.com.br?subject=Contato via Site';
  }

  openPhone(): void {
    window.location.href = 'tel:+5565993421407';
  }
} 
