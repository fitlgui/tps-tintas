import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService, User } from 'src/app/services/users/users.service';
import { AuthService } from 'src/app/services/admin/admin.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  allUsers: User[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  
  private searchSubject = new Subject<string>();

  constructor(
    private usersService: UsersService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterUsers(searchTerm);
      });
  }

  private loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (data: User[]) => {
        this.allUsers = data;
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  private filterUsers(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.users = this.allUsers;
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    this.users = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.age.toString().includes(searchLower)
    );
  }

  createUser(): void {
    if (this.canEdit()) {
      this.router.navigate(['/admin/users/add']);
    }
  }

  editUser(userId: number): void {
    if (this.canEdit()) {
      this.router.navigate(['/admin/users/edit', userId]);
    }
  }

  deleteUser(userId: number): void {
    if (!this.canEdit()) {
      alert('Você não tem permissão para excluir usuários.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers(); // Recarregar lista
          alert('Usuário excluído com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
          alert('Erro ao excluir usuário. Tente novamente.');
        }
      });
    }
  }

  // Método para verificar se o usuário pode editar
  canEdit(): boolean {
    return this.authService.canEdit();
  }

  // Método para verificar se o usuário pode visualizar
  canView(): boolean {
    return this.authService.canView();
  }

  getRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  }

  getRoleClass(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  }
}
