import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/admin/admin.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  sessionTimeRemaining = 0;
  private sessionCheckInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Atualizar tempo restante da sessão a cada minuto
    this.updateSessionTime();
    this.sessionCheckInterval = setInterval(() => {
      this.updateSessionTime();
    }, 60000); // Atualiza a cada 1 minuto
  }

  ngOnDestroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }

  private updateSessionTime(): void {
    this.sessionTimeRemaining = this.authService.getSessionTimeRemaining();

    // Se restam menos de 5 minutos, mostrar aviso
    if (this.sessionTimeRemaining <= 5 && this.sessionTimeRemaining > 0) {
      console.warn(`Atenção: Sessão expira em ${this.sessionTimeRemaining} minuto(s)`);
    }
  }

  renewSession(): void {
    this.authService.renewSession();
    this.updateSessionTime();
  }

  logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
