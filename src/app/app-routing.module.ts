import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductCardComponent } from './shareds/product-card/product-card.component';
import { authGuard } from './core/guards/auth.guard';
import { CatalogComponent } from './components/catalog/catalog.component';
import { LoginComponent } from './auth/login/login.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'catalog/:id', component: ProductCardComponent },
  { path: 'contact', component: ContactComponent },
  {
    // Rotas Admin Protegidas
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  title = 'TPS Tintas';
}
