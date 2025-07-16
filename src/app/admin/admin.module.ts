import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { AddComponent } from './products/add/add.component';
import { EditComponent } from './products/edit/edit.component';


@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    HomeComponent,
    ProductsComponent,
    AddComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule
  ]
})
export class AdminModule { }
