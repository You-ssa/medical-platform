import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ProfilDetailComponent } from '../../profil-detail/profil-detail.component';
import { StatsService } from '../../services/stats.service';
import { UserService, User } from '../../services/user.service';

// Avatar SVG inline — aucun fichier externe requis, plus de 404
const DEFAULT_AVATAR = `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><circle cx='60' cy='60' r='60' fill='%23e8edf5'/><circle cx='60' cy='45' r='22' fill='%23b0bec5'/><ellipse cx='60' cy='105' rx='34' ry='24' fill='%23b0bec5'/></svg>`;

@Component({
  selector: 'app-gestion-secretaires',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ProfilDetailComponent],
  templateUrl: './gestion-secretaire.component.html',
  styleUrls: ['./gestion-secretaire.component.css']
})
export class GestionSecretairesComponent implements OnInit {

  activeTab: 'approuves' | 'en_attente' = 'en_attente';

  // ── Secrétaires approuvé(e)s ──────────────────────────────
  secretaires: any[]         = [];
  filteredSecretaires: any[] = [];
  searchTerm       = '';
  filterDepartement = '';
  loading          = false;
  selectedSecretaire: any = null;

  // ── Secrétaires en attente ────────────────────────────────
  secretairesEnAttente: User[] = [];
  loadingEnAttente  = false;
  errorEnAttente    = '';
  selectedUserProfil: User | null = null;

  departements: string[] = [
    'Cardiologie', 'Pédiatrie', 'Neurologie', 'Dermatologie',
    'Orthopédie', 'Ophtalmologie', 'ORL', 'Psychiatrie',
    'Radiologie', 'Urgences', 'Administration', 'Chirurgie'
  ];

  constructor(
    private statsService: StatsService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadSecretaires(),
      this.loadSecretairesEnAttente()
    ]);
  }

  // ════════════════════════════════════════════════════════════
  // Utilitaire photo — résout l'erreur 431 et le 404 avatar
  // ════════════════════════════════════════════════════════════

  getPhotoSrc(photoBase64: string | null | undefined): string {
    if (!photoBase64 || photoBase64.trim().length < 10) {
      return DEFAULT_AVATAR;
    }
    if (photoBase64.startsWith('data:image')) {
      return photoBase64;
    }
    return `data:image/jpeg;base64,${photoBase64}`;
  }

  // ════════════════════════════════════════════════════════════
  // Secrétaires approuvé(e)s — GET /api/secretaires-approuves
  // ════════════════════════════════════════════════════════════

  async loadSecretaires() {
    try {
      this.loading = true;
      this.secretaires         = await this.statsService.getSecretairesList();
      this.filteredSecretaires = [...this.secretaires];
    } catch (error) {
      console.error('Erreur chargement secrétaires:', error);
      this.secretaires = this.filteredSecretaires = [];
    } finally {
      this.loading = false;
    }
  }

  searchSecretaires()     { this.applyFilters(); }
  filterByDepartement()   { this.applyFilters(); }

  applyFilters() {
    let result = [...this.secretaires];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s =>
        s.nom?.toLowerCase().includes(term)          ||
        s.prenom?.toLowerCase().includes(term)       ||
        s.email?.toLowerCase().includes(term)        ||
        s.poste?.toLowerCase().includes(term)        ||
        s.departement?.toLowerCase().includes(term)
      );
    }
    if (this.filterDepartement) {
      result = result.filter(s => s.departement === this.filterDepartement);
    }
    this.filteredSecretaires = result;
  }

  getDepartementCount(d: string): number {
    return this.secretaires.filter(s => s.departement === d).length;
  }

  viewSecretaire(secretaire: any) {
    this.selectedSecretaire = secretaire;
    document.body.style.overflow = 'hidden';
  }

  closeSecretaireDetail() {
    this.selectedSecretaire = null;
    document.body.style.overflow = 'auto';
  }

  async deleteSecretaire(id: string) {
    if (!id) { alert('Identifiant du/de la secrétaire introuvable'); return; }
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce/cette secrétaire ?')) return;
    try {
      await this.userService.refuserUtilisateur(id, 'secretaire');
      await this.loadSecretaires();
      alert('Secrétaire supprimé(e) avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // ════════════════════════════════════════════════════════════
  // Secrétaires en attente — GET /api/utilisateurs-en-attente/secretaire
  // ════════════════════════════════════════════════════════════

  async loadSecretairesEnAttente() {
    try {
      this.loadingEnAttente = true;
      this.errorEnAttente   = '';
      this.secretairesEnAttente = await this.userService.getUtilisateursEnAttente('secretaire');
    } catch (error: any) {
      console.error('Erreur chargement secrétaires en attente:', error);
      this.errorEnAttente       = 'Impossible de charger les demandes en attente.';
      this.secretairesEnAttente = [];
    } finally {
      this.loadingEnAttente = false;
    }
  }

  showProfilDetail(user: User) {
    this.selectedUserProfil = user;
    document.body.style.overflow = 'hidden';
  }

  closeProfilDetail() {
    this.selectedUserProfil = null;
    document.body.style.overflow = 'auto';
  }

  async handleApprove(user: User) {
    if (!user.id) return;
    await this.approuverSecretaire(user.id);
    this.closeProfilDetail();
  }

  async handleReject(user: User) {
    if (!user.id) return;
    await this.refuserSecretaire(user.id);
    this.closeProfilDetail();
  }

  async approuverSecretaire(id: string) {
    if (!id) { alert('ID du/de la secrétaire invalide'); return; }
    try {
      await this.userService.approuverUtilisateur(id, 'secretaire');
      await Promise.all([this.loadSecretairesEnAttente(), this.loadSecretaires()]);
      alert('Secrétaire approuvé(e) avec succès !');
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert("Erreur lors de l'approbation.");
    }
  }

  async refuserSecretaire(id: string) {
    if (!id) { alert('ID du/de la secrétaire invalide'); return; }
    if (!confirm('Êtes-vous sûr de vouloir refuser ce/cette secrétaire ?')) return;
    try {
      await this.userService.refuserUtilisateur(id, 'secretaire');
      await this.loadSecretairesEnAttente();
      alert('Secrétaire refusé(e).');
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('Erreur lors du refus.');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return 'N/A'; }
  }
}