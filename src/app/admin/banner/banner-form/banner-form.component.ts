import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerService } from 'src/app/services/banner/banner.service';
import { Banner } from 'src/app/models/banner.model';
import { NotificationService } from 'src/app/services/ui/notification.service';

@Component({
    selector: 'app-banner-form',
    templateUrl: './banner-form.component.html',
    // O estilo específico foi removido, confie no Tailwind!
    styleUrls: []
})
export class BannerFormComponent implements OnInit {

    bannerForm: FormGroup;
    isEdit = false;
    bannerId?: number;
    loading = false;
    error = '';

    // Imagem para pré-visualização (pode ser uma string base64 completa ou uma URL)
    imgPreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private bannerService: BannerService,
        private route: ActivatedRoute,
        private router: Router,
        private notificationService: NotificationService
    ) {
        // Definimos a estrutura do formulário com validações
        this.bannerForm = this.fb.group({
            titulo: ['', Validators.required],
            imagem: ['', Validators.required],
            ativo: [false]
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const idStr = params.get('id');
            if (idStr) {
                const idNum = Number(idStr);
                if (!isNaN(idNum)) {
                    this.isEdit = true;
                    this.bannerId = idNum;
                    this.loadBanner();
                } else {
                    // Lógica de erro para ID inválido, se necessário
                    this.error = 'ID de banner inválido.';
                }
            }
        });
    }

    private loadBanner() {
        this.loading = true;
        this.bannerService.getBannerById(this.bannerId!).subscribe({
            next: (banner: Banner) => {
                this.bannerForm.patchValue(banner);
                this.imgPreview = banner.imagem ? this.getImageSrc(banner.imagem) : null;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Erro ao carregar os dados do banner. Tente novamente mais tarde.';
                this.loading = false;
                console.error('Erro ao carregar banner:', err);
            }
        });
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            this.fileToBase64(file).then(base64 => {
                this.bannerForm.patchValue({ imagem: base64 });
                this.imgPreview = this.getImageSrc(base64);
            });
        }
    }

    // Converte Blob/File para base64 string
    private fileToBase64(file: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Retorna apenas o base64 puro (sem prefixo)
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Gera o src para preview a partir do base64 puro
    getImageSrc(imagem: string): string {
        if (!imagem) return '';
        // Se já tem prefixo data:image, tenta corrigir para o correto
        if (imagem.startsWith('data:image/')) {
            // Corrige prefixos errados para o tipo correto
            const base64 = imagem.split(',')[1] || '';
            if (base64.startsWith('iVBOR')) return 'data:image/png;base64,' + base64;
            if (base64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + base64;
            if (base64.startsWith('UklGR')) return 'data:image/webp;base64,' + base64;
            if (base64.startsWith('R0lG')) return 'data:image/gif;base64,' + base64;
            if (base64.startsWith('Qk')) return 'data:image/bmp;base64,' + base64;
            if (base64.startsWith('PD94bWwg')) return 'data:image/svg+xml;base64,' + base64;
            // Se não reconhecido, mantém o original
            return imagem;
        }
        // Sem prefixo, detecta pelo início do base64
        if (imagem.startsWith('iVBOR')) return 'data:image/png;base64,' + imagem;
        if (imagem.startsWith('/9j/')) return 'data:image/jpeg;base64,' + imagem;
        if (imagem.startsWith('UklGR')) return 'data:image/webp;base64,' + imagem;
        if (imagem.startsWith('R0lG')) return 'data:image/gif;base64,' + imagem;
        if (imagem.startsWith('Qk')) return 'data:image/bmp;base64,' + imagem;
        if (imagem.startsWith('PD94bWwg')) return 'data:image/svg+xml;base64,' + imagem;
        // Default para png
        return 'data:image/png;base64,' + imagem;
    }

    async onSubmit() {
        if (this.bannerForm.invalid || this.loading) return;
        this.loading = true;
        this.error = '';
        const bannerData: Banner = this.bannerForm.value;
        if (this.isEdit && this.bannerId) {
            this.bannerService.updateBanner(this.bannerId, bannerData).subscribe({
                next: async () => {
                    await this.notificationService.success('Banner atualizado com sucesso!');
                    this.router.navigate(['/admin/banner']);
                    this.loading = false;
                },
                error: async (err) => {
                    await this.notificationService.error('Erro ao atualizar o banner. Tente novamente.');
                    this.error = 'Erro ao atualizar o banner. Tente novamente.';
                    this.loading = false;
                    console.error('Erro ao atualizar:', err);
                }
            });
        } else {
            this.bannerService.createBanner(bannerData).subscribe({
                next: async () => {
                    await this.notificationService.success('Banner criado com sucesso!');
                    this.router.navigate(['/admin/banner']);
                    this.loading = false;
                },
                error: async (err) => {
                    await this.notificationService.error('Erro ao criar o banner. Tente novamente.');
                    this.error = 'Erro ao criar o banner. Tente novamente.';
                    this.loading = false;
                    console.error('Erro ao criar:', err);
                }
            });
        }
    }
}