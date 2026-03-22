import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { AddComponent } from './products/add/add.component';
import { EditComponent } from './products/edit/edit.component';
import { UsersComponent } from './users/users.component';
import { CreateComponent } from './users/create/create.component';
import { EditComponent as EditUserComponent } from './users/edit/edit.component';

import { BannerListComponent } from './banner/banner-list/banner-list.component';
import { BannerFormComponent } from './banner/banner-form/banner-form.component';
import { ToolsModule } from './tools/tools.module';


@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    HomeComponent,
    ProductsComponent,
    AddComponent,
    EditComponent,
    UsersComponent,
    CreateComponent,
    EditUserComponent,
    BannerListComponent,
    BannerFormComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToolsModule
  ]
})
export class AdminModule { }
