import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { EditComponent } from './products/edit/edit.component';
import { AddComponent } from './products/add/add.component';
import { UsersComponent } from './users/users.component';
import { CreateComponent } from './users/create/create.component';
import { EditComponent as EditUserComponent } from './users/edit/edit.component';
import { adminEditGuard } from '../core/guards/admin-edit.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'produtos', component: ProductsComponent },
      { path: 'products/add', component: AddComponent, canActivate: [adminEditGuard] },
      { path: 'products/edit/:id', component: EditComponent, canActivate: [adminEditGuard] },
      { path: 'users', component: UsersComponent },
      { path: 'users/add', component: CreateComponent, canActivate: [adminEditGuard] },
      { path: 'users/edit/:id', component: EditUserComponent, canActivate: [adminEditGuard] },
      {
        path: 'tools',
        loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
