import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductCardComponent } from './shareds/product-card/product-card.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: HomeComponent },
  { path: 'catalog/:id', component: ProductCardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
