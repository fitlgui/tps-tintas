
import { Component, OnInit } from '@angular/core';
import { BannerService } from 'src/app/services/banner/banner.service';
import { Banner } from 'src/app/models/banner.model';
import { NotificationService } from 'src/app/services/ui/notification.service';

@Component({
    selector: 'app-banner-list',
    templateUrl: './banner-list.component.html',
    // styleUrls: ['./banner-list.component.scss'] -> Removido: vamos focar 100% no Tailwind CSS
})
export class BannerListComponent implements OnInit {
    banners: Banner[] = [];
    loading = true; // Iniciamos como true para evitar "piscar" a tela vazia
    error = '';

    constructor(
        private bannerService: BannerService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.fetchBanners();
    }

    async fetchBanners() {
        this.loading = true;
        this.error = '';
        this.bannerService.getBanners().subscribe({
            next: (banners: Banner[]) => {
                this.banners = banners;
                this.loading = false;
            },
            error: async (err) => {
                this.error = 'Não foi possível carregar a lista de banners. Tente novamente mais tarde.';
                this.loading = false;
                console.error('Erro ao carregar banners:', err);
                await this.notificationService.error('Erro ao carregar banners.');
            }
        });
    }

    async deleteBanner(id?: number) {
        if (!id) return;
        const confirmed = await this.notificationService.confirm(
            'Tem certeza que deseja remover este banner permanentemente?',
            'Remover banner',
            'Remover',
            'Cancelar'
        );
        if (!confirmed) return;
        this.loading = true;
        this.bannerService.deleteBanner(id).subscribe({
            next: async () => {
                await this.notificationService.success('Banner removido com sucesso!');
                this.fetchBanners();
            },
            error: async (err) => {
                this.error = 'Erro ao tentar remover o banner.';
                this.loading = false;
                console.error('Erro ao remover:', err);
                await this.notificationService.error('Erro ao remover banner.');
            }
        });
    }
    getImageSrc(imagem: string): string {
        if (!imagem) return '';
        if (imagem.startsWith('data:')) return imagem;
        if (imagem.startsWith('iVBOR')) return 'data:image/png;base64,' + imagem;
        if (imagem.startsWith('/9j/')) return 'data:image/jpeg;base64,' + imagem;
        if (imagem.startsWith('UklGR')) return 'data:image/webp;base64,' + imagem;
        return 'data:image/png;base64,' + imagem;
    }
}