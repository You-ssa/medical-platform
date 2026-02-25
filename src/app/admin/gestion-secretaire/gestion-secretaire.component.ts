import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ProfilDetailComponent } from '../../profil-detail/profil-detail.component';
import { StatsService } from '../../services/stats.service';
import { UserService, User } from '../../services/user.service';
import { SpecialiteService } from '../../services/specialite.service';
import { firstValueFrom } from 'rxjs';

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

  secretaires: any[] = [];
  filteredSecretaires: any[] = [];
  searchTerm = '';
  filterSpecialite = '';
  loading = false;
  selectedSecretaire: any = null;

  secretairesEnAttente: User[] = [];
  loadingEnAttente = false;
  errorEnAttente = '';
  selectedUserProfil: User | null = null;

  specialites: string[] = [];
  loadingSpecialites = false;
  showAllSpecialites = false;

  // États pour les imports/exports
  exportingApprouves = false;
  exportingEnAttente = false;
  importingApprouves = false;
  importingEnAttente = false;

  @ViewChild('fileInputApprouves') fileInputApprouves!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputEnAttente') fileInputEnAttente!: ElementRef<HTMLInputElement>;

  constructor(
    private statsService: StatsService,
    private userService: UserService,
    private specialiteService: SpecialiteService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadSecretaires(),
      this.loadSecretairesEnAttente(),
      this.loadSpecialites()
    ]);
  }

  // ════════════════════════════════════════════════════════════
  // Spécialités (depuis l'API)
  // ════════════════════════════════════════════════════════════
  async loadSpecialites() {
    this.loadingSpecialites = true;
    try {
      const specs = await firstValueFrom(this.specialiteService.getSpecialites());
      if (Array.isArray(specs)) {
        this.specialites = specs.map(s => s.nom);
      } else {
        console.error('Format de réponse inattendu pour les spécialités', specs);
        this.specialites = [];
      }
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
      this.specialites = [];
    } finally {
      this.loadingSpecialites = false;
    }
  }

  toggleSpecialites() {
    this.showAllSpecialites = !this.showAllSpecialites;
  }

  // ════════════════════════════════════════════════════════════
  // Utilitaire photo
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
  // Secrétaires approuvé(e)s
  // ════════════════════════════════════════════════════════════
  async loadSecretaires() {
    try {
      this.loading = true;
      const data = await this.statsService.getSecretairesList();
      // Transformation : si la propriété 'specialite' n'existe pas, on prend 'departement'
      this.secretaires = data.map(s => ({
        ...s,
        specialite: s.specialite || s.departement || '—'
      }));
      this.filteredSecretaires = [...this.secretaires];
    } catch (error) {
      console.error('Erreur chargement secrétaires:', error);
      this.secretaires = this.filteredSecretaires = [];
    } finally {
      this.loading = false;
    }
  }

  searchSecretaires()     { this.applyFilters(); }
  filterBySpecialite()    { this.applyFilters(); }

  applyFilters() {
    let result = [...this.secretaires];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s =>
        s.nom?.toLowerCase().includes(term)          ||
        s.prenom?.toLowerCase().includes(term)       ||
        s.email?.toLowerCase().includes(term)        ||
        s.poste?.toLowerCase().includes(term)        ||
        s.specialite?.toLowerCase().includes(term)
      );
    }
    if (this.filterSpecialite) {
      result = result.filter(s => s.specialite === this.filterSpecialite);
    }
    this.filteredSecretaires = result;
  }

  getSpecialiteCount(spec: string): number {
    return this.secretaires.filter(s => s.specialite === spec).length;
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
  // Secrétaires en attente
  // ════════════════════════════════════════════════════════════
  async loadSecretairesEnAttente() {
    try {
      this.loadingEnAttente = true;
      this.errorEnAttente   = '';
      const data = await this.userService.getUtilisateursEnAttente('secretaire');
      // Transformation identique pour les secrétaires en attente
      this.secretairesEnAttente = data.map(s => ({
        ...s,
        specialite: s.specialite || s.departement || '—'
      }));
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

  // ============================================================
  // EXPORT - Secrétaires approuvées
  // ============================================================
  exportApprouvesToCSV() {
    if (this.secretaires.length === 0) {
      alert('Aucune secrétaire approuvée à exporter.');
      return;
    }

    this.exportingApprouves = true;

    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité', 'Poste', 'Département', 'Adresse Hôpital', 'Date inscription', 'Sexe'];
    const keys: (keyof typeof this.secretaires[0])[] = [
      'nom', 'prenom', 'email', 'telephone', 'specialite', 'poste', 'departement', 'adresseHopital', 'dateInscription', 'sexe'
    ];

    const csvRows = [headers.join(',')];

    for (const secretaire of this.secretaires) {
      const values = keys.map(key => {
        let value = secretaire[key] || '';
        if (key === 'dateInscription') {
          value = this.formatDate(value);
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'secretaires_approuvees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.exportingApprouves = false;
  }

  // ============================================================
  // EXPORT - Secrétaires en attente
  // ============================================================
  exportEnAttenteToCSV() {
    if (this.secretairesEnAttente.length === 0) {
      alert('Aucune secrétaire en attente à exporter.');
      return;
    }

    this.exportingEnAttente = true;

    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité', 'Poste', 'Département', 'Adresse Hôpital', 'Date inscription', 'Sexe'];
    const keys: (keyof User)[] = [
      'nom', 'prenom', 'email', 'telephone', 'specialite', 'poste', 'departement', 'adresseHopital', 'dateInscription', 'sexe'
    ];

    const csvRows = [headers.join(',')];

    for (const secretaire of this.secretairesEnAttente) {
      const values = keys.map(key => {
        let value = (secretaire as any)[key] || '';
        if (key === 'dateInscription') {
          value = this.formatDate(value as string);
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'secretaires_en_attente.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.exportingEnAttente = false;
  }

  // ============================================================
  // IMPORT - Secrétaires approuvées
  // ============================================================
  triggerFileInputApprouves() {
    this.fileInputApprouves.nativeElement.click();
  }

  onFileSelectedApprouves(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.importingApprouves = true;

    this.userService.importSecretaires(file, 'approuve').subscribe({
      next: (response) => {
        this.importingApprouves = false;
        const message = `Import réussi ! ${response.successCount} secrétaires importées avec le statut "approuvé".`;
        if (response.failedCount > 0) {
          alert(message + `\n${response.failedCount} lignes en erreur.`);
        } else {
          alert(message);
        }
        this.loadSecretaires();
        this.loadSecretairesEnAttente();
        input.value = '';
      },
      error: (err) => {
        this.importingApprouves = false;
        console.error('Erreur import :', err);
        const errorMsg = err.error?.message || err.message || 'Erreur lors de l’import. Vérifiez le format du fichier.';
        alert(errorMsg);
        input.value = '';
      }
    });
  }

  // ============================================================
  // IMPORT - Secrétaires en attente
  // ============================================================
  triggerFileInputEnAttente() {
    this.fileInputEnAttente.nativeElement.click();
  }

  onFileSelectedEnAttente(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.importingEnAttente = true;

    this.userService.importSecretaires(file, 'en_attente').subscribe({
      next: (response) => {
        this.importingEnAttente = false;
        const message = `Import réussi ! ${response.successCount} secrétaires importées avec le statut "en attente".`;
        if (response.failedCount > 0) {
          alert(message + `\n${response.failedCount} lignes en erreur.`);
        } else {
          alert(message);
        }
        this.loadSecretaires();
        this.loadSecretairesEnAttente();
        input.value = '';
      },
      error: (err) => {
        this.importingEnAttente = false;
        console.error('Erreur import :', err);
        const errorMsg = err.error?.message || err.message || 'Erreur lors de l’import. Vérifiez le format du fichier.';
        alert(errorMsg);
        input.value = '';
      }
    });
  }
}