import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductCardComponent } from './shareds/product-card/product-card.component';
import { authGuard } from './core/guards/auth.guard';
import { CatalogComponent } from './components/catalog/catalog.component';
import { LoginComponent } from './auth/login/login.component';
import { ContactComponent } from './components/contact/contact.component';
import { OurteamComponent } from './components/ourteam/ourteam.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'TPS Tintas Cuiabá - Tintas WEG Industriais e Automotivas | Mato Grosso',
      description: 'Revenda autorizada WEG em Cuiabá. Tintas industriais, automotivas e residenciais com cores personalizadas.',
      keywords: 'tintas cuiabá, tintas industriais, WEG tintas, cores personalizadas, mato grosso'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login - TPS Tintas Cuiabá',
      description: 'Acesse sua conta na TPS Tintas para gerenciar pedidos e acompanhar compras.'
    }
  },
  {
    path: 'catalog',
    component: CatalogComponent,
    data: {
      title: 'Catálogo de Tintas - TPS Tintas Cuiabá | Industriais e Automotivas',
      description: 'Catálogo completo de tintas WEG industriais, automotivas e residenciais. Cores personalizadas em Cuiabá.',
      keywords: 'catálogo tintas, tintas weg cuiabá, tintas industriais catálogo, preços tintas'
    }
  },
  {
    path: 'catalog/:id',
    component: ProductCardComponent,
    data: {
      title: 'Produto - TPS Tintas Cuiabá',
      description: 'Detalhes do produto de tinta WEG. Qualidade garantida e entrega em Cuiabá.'
    }
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      title: 'Contato - TPS Tintas Cuiabá | Fale Conosco',
      description: 'Entre em contato com a TPS Tintas em Cuiabá. Atendimento especializado em tintas WEG industriais.',
      keywords: 'contato tps tintas, telefone tintas cuiabá, endereço loja tintas'
    }
  },
  {
    path: 'ourteam',
    component: OurteamComponent,
    data: {
      title: 'Quem Somos - TPS Tintas Cuiabá | Nossa História e Valores',
      description: 'Conheça a história da TPS Tintas, parceira WEG em Cuiabá desde 2005. Missão, visão e valores.',
      keywords: 'sobre tps tintas, história empresa tintas, parceiro weg cuiabá'
    }
  },
  {
    // Rotas Admin Protegidas
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'top',
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  title = 'TPS Tintas';
}
