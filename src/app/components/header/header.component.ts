import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;
  isMobileMenuOpen = false;
  cartService = inject(CartService);

  constructor(private readonly router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isMobileMenuOpen) {
      this.mobileMenu.nativeElement.classList.remove('hidden');
      this.mobileMenu.nativeElement.classList.add('animate-fadeIn');
    } else {
      this.mobileMenu.nativeElement.classList.add('hidden');
      this.mobileMenu.nativeElement.classList.remove('animate-fadeIn');
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.mobileMenu.nativeElement.classList.add('hidden');
    this.mobileMenu.nativeElement.classList.remove('animate-fadeIn');
  }
}
