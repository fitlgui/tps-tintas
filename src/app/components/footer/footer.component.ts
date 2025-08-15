import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {


  constructor(private readonly router: Router) { }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  goToMaps() {
    window.open('https://maps.app.goo.gl/bF53ZJgDU6WifmL4A', '_blank');
  }
}
