import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AdminService, Admin, NewAdmin } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestion-sous-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './gestion-sousadmin.component.html',
  styleUrls: ['./gestion-sousadmin.component.css']
})
export class GestionSousAdminComponent implements OnInit {

  admins: Admin[]         = [];
  filteredAdmins: Admin[] = [];

  searchQuery = '';
  filterRole: 'all' | 'principal' | 'sous-admin' = 'all';

  showPasswordModal = false;
  passwordInput     = '';
  passwordError     = '';
  isVerifying       = false;

  showAddModal      = false;

  newAdmin: NewAdmin = {
    nom: '', prenom: '', email: '',
    motDePasse: '', telephone: '', role: 'sous-admin'
  };

  confirmPassword  = '';
  passwordMismatch = false;
  isLoading        = false;
  successMessage   = '';
  errorMessage     = '';
  isDeleting       = false;

  // ── Pagination ───────────────────────────────────────────────
  pageSize    = 5;
  currentPage = 1;

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  // ── Pagination getters ───────────────────────────────────────

  get pageStart(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get pageEnd(): number {
    return Math.min(this.pageStart + this.pageSize, this.filteredAdmins.length);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAdmins.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedAdmins(): Admin[] {
    return this.filteredAdmins.slice(this.pageStart, this.pageEnd);
  }

  // ── Pagination methods ───────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  // ── Data ─────────────────────────────────────────────────────

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: (data) => { this.admins = data; this.applyFilters(); },
      error: (err)  => console.error('Erreur chargement admins', err)
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredAdmins = this.admins.filter(a => {
      const matchRole   = this.filterRole === 'all' || a.role === this.filterRole;
      const matchSearch = !q ||
        a.nom.toLowerCase().includes(q) ||
        a.prenom.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
    this.currentPage = 1;
  }

  setFilter(role: 'all' | 'principal' | 'sous-admin'): void {
    this.filterRole = role;
    this.applyFilters();
  }

  onSearch(): void { this.applyFilters(); }

  // ── Étape 1 : vérification préalable côté client ─────────────

  openAddAdminFlow(): void {
    const currentAdmin = this.authService.getCurrentAdmin();

    if (!currentAdmin) {
      alert('Session expirée ou vous n\'êtes pas un admin. Veuillez vous reconnecter.');
      return;
    }

    if (!currentAdmin.role) {
      console.error('Rôle manquant dans les données de session :', currentAdmin);
      alert('Erreur de session : informations admin incomplètes (rôle manquant). Veuillez vous reconnecter.');
      this.authService.logout();
      return;
    }

    if (currentAdmin.role !== 'principal') {
      alert('Accès refusé : seuls les admins principaux peuvent ajouter des admins.');
      return;
    }

    this.passwordInput = '';
    this.passwordError = '';
    this.isVerifying = false;
    this.showPasswordModal = true;
  }

  closePasswordModal(): void { this.showPasswordModal = false; }

  // ── Étape 2 : vérification mot de passe via backend ──────────

  verifyPrincipalPassword(): void {
    if (!this.passwordInput.trim()) {
      this.passwordError = 'Mot de passe requis';
      return;
    }

    const currentAdmin = this.authService.getCurrentAdmin();

    if (!currentAdmin) {
      this.passwordError = 'Session expirée, veuillez vous reconnecter';
      return;
    }

    if (!currentAdmin.role || currentAdmin.role !== 'principal') {
      this.passwordError = 'Accès réservé aux admins principaux';
      return;
    }

    this.isVerifying = true;

    this.http.post<{ valid: boolean; role: string }>(
      `${this.apiUrl}/verify-admin-password`,
      {
        motDePasse: this.passwordInput,
        adminId:    currentAdmin.id
      }
    ).subscribe({
      next: (res) => {
        this.isVerifying = false;
        if (res.valid && res.role === 'principal') {
          this.showPasswordModal = false;
          this.openAddModal();
        } else {
          this.passwordError = 'Accès refusé';
        }
      },
      error: (err) => {
        this.isVerifying = false;
        this.passwordError = err.error?.message || 'Erreur serveur';
      }
    });
  }

  openAddModal(): void {
    this.newAdmin = {
      nom: '', prenom: '', email: '',
      motDePasse: '', telephone: '', role: 'sous-admin'
    };
    this.confirmPassword  = '';
    this.successMessage   = '';
    this.errorMessage     = '';
    this.passwordMismatch = false;
    this.showAddModal     = true;
  }

  closeAddModal(): void { this.showAddModal = false; }

  checkPasswords(): void {
    this.passwordMismatch = this.newAdmin.motDePasse !== this.confirmPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) return;

    this.isLoading    = true;
    this.errorMessage = '';

    this.adminService.createAdmin(this.newAdmin).subscribe({
      next: () => {
        this.isLoading = false;
        this.loadAdmins();
        this.showAddModal = false;
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
      }
    });
  }

  onDelete(id: string): void {
    if (!confirm('Supprimer cet admin ?')) return;
    this.isDeleting = true;
    this.adminService.deleteAdmin(id).subscribe({
      next:  () => { this.isDeleting = false; this.loadAdmins(); },
      error: () => { this.isDeleting = false; }
    });
  }

  getRoleLabel(role?: string): string {
    return role === 'principal' ? 'Admin Principal' : 'Sous Admin';
  }
}