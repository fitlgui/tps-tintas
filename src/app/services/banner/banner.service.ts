import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../../models/banner.model';
import { environment } from 'src/environment/enviroment';

@Injectable({ providedIn: 'root' })
export class BannerService {
    private apiUrl = environment.apiUrl + '/banner';

    constructor(private http: HttpClient) { }

    getBanners(): Observable<Banner[]> {
        return this.http.get<Banner[]>(this.apiUrl);
    }

    getBannerById(id: number): Observable<Banner> {
        return this.http.get<Banner>(`${this.apiUrl}/${id}`);
    }


    createBanner(banner: Partial<Banner>): Observable<Banner> {
        // Remove campo descricao se vier por acidente
        const { imagem, descricao, ...rest } = banner as any;
        return this.http.post<Banner>(this.apiUrl, { ...rest, imagem });
    }

    updateBanner(id: number, banner: Partial<Banner>): Observable<Banner> {
        const { imagem, descricao, ...rest } = banner as any;
        return this.http.patch<Banner>(`${this.apiUrl}/${id}`, { ...rest, imagem });
    }

    deleteBanner(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
