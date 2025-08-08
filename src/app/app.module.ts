import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductCardComponent } from './shareds/product-card/product-card.component';
import { HomeComponent } from './components/home/home.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { ContactComponent } from './components/contact/contact.component';
import { ShoppingComponent } from './components/shopping/shopping.component';
import { OurteamComponent } from './components/ourteam/ourteam.component';
import { SharedPipesModule } from './shareds/shared-pipes.module';
import { ProductImagePipe } from './pipes/product-image.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ProductCardComponent,
    HomeComponent,
    CatalogComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    ContactComponent,
    ShoppingComponent,
    OurteamComponent,
    ProductImagePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SharedPipesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
