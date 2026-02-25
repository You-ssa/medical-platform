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
  selector: 'app-gestion-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ProfilDetailComponent],
  templateUrl: './gestion-medecins.component.html',
  styleUrls: ['./gestion-medecins.component.css']
})
export class GestionMedecinsComponent implements OnInit {

  activeTab: 'approuves' | 'en_attente' = 'en_attente';

  medecins: any[] = [];
  filteredMedecins: any[] = [];
  searchTerm = '';
  filterSpecialite = '';
  loading = false;
  selectedMedecin: any = null;

  medecinsEnAttente: User[] = [];
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
      this.loadMedecins(),
      this.loadMedecinsEnAttente(),
      this.loadSpecialites()
    ]);
  }

  // ──────────────────────────────
  // Spécialités
  // ──────────────────────────────
  async loadSpecialites() {
    this.loadingSpecialites = true;
    try {
      const specs = await firstValueFrom(this.specialiteService.getSpecialites());
      this.specialites = Array.isArray(specs) ? specs.map(s => s.nom) : [];
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

  getPhotoSrc(photoBase64: string | null | undefined): string {
    if (!photoBase64 || photoBase64.trim().length < 10) return DEFAULT_AVATAR;
    return photoBase64.startsWith('data:image') ? photoBase64 : `data:image/jpeg;base64,${photoBase64}`;
  }

  // ──────────────────────────────
  // Médecins approuvés
  // ──────────────────────────────
  async loadMedecins() {
    try {
      this.loading = true;
      this.medecins = await this.statsService.getMedecinsList();
      this.filteredMedecins = [...this.medecins];
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      this.medecins = this.filteredMedecins = [];
    } finally { this.loading = false; }
  }

  searchMedecins() { this.applyFilters(); }
  filterBySpecialite() { this.applyFilters(); }

  applyFilters() {
    let result = [...this.medecins];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      result = result.filter(m =>
        m.nom?.toLowerCase().includes(term) ||
        m.prenom?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.specialite?.toLowerCase().includes(term)
      );
    }
    if (this.filterSpecialite) {
      result = result.filter(m => m.specialite === this.filterSpecialite);
    }
    this.filteredMedecins = result;
  }

  getSpecialiteCount(s: string): number {
    return this.medecins.filter(m => m.specialite === s).length;
  }

  viewMedecin(medecin: any) {
    this.selectedMedecin = medecin;
    document.body.style.overflow = 'hidden';
  }

  closeMedecinDetail() {
    this.selectedMedecin = null;
    document.body.style.overflow = 'auto';
  }

  async deleteMedecin(id: string) {
    if (!id) { alert('Identifiant du médecin introuvable'); return; }
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) return;
    try {
      await this.userService.refuserUtilisateur(id, 'medecin');
      await this.loadMedecins();
      alert('Médecin supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // ──────────────────────────────
  // Médecins en attente
  // ──────────────────────────────
  async loadMedecinsEnAttente() {
    try {
      this.loadingEnAttente = true;
      this.errorEnAttente = '';
      this.medecinsEnAttente = await this.userService.getUtilisateursEnAttente('medecin');
    } catch (error: any) {
      console.error('Erreur chargement médecins en attente:', error);
      this.errorEnAttente = 'Impossible de charger les demandes en attente.';
      this.medecinsEnAttente = [];
    } finally { this.loadingEnAttente = false; }
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
    await this.approuverMedecin(user.id);
    this.closeProfilDetail();
  }

  async handleReject(user: User) {
    if (!user.id) return;
    await this.refuserMedecin(user.id);
    this.closeProfilDetail();
  }

  async approuverMedecin(id: string) {
    if (!id) return;
    try {
      await this.userService.approuverUtilisateur(id, 'medecin');
      await Promise.all([this.loadMedecinsEnAttente(), this.loadMedecins()]);
      alert('Médecin approuvé avec succès !');
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert("Erreur lors de l'approbation.");
    }
  }

  async refuserMedecin(id: string) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir refuser ce médecin ?')) return;
    try {
      await this.userService.refuserUtilisateur(id, 'medecin');
      await this.loadMedecinsEnAttente();
      alert('Médecin refusé.');
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

  // ──────────────────────────────
  // Export CSV - Médecins approuvés
  // ──────────────────────────────
  exportApprouvesToCSV() {
    if (this.medecins.length === 0) {
      alert('Aucun médecin approuvé à exporter.');
      return;
    }

    this.exportingApprouves = true;

    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité', 'RPPS', 'Adresse Hôpital', 'Date inscription', 'Sexe'];
    const keys: (keyof typeof this.medecins[0])[] = [
      'nom','prenom','email','telephone','specialite','rpps','adresseHopital','dateInscription','sexe'
    ];

    const csvRows = [headers.join(',')];

    for (const med of this.medecins) {
      const values = keys.map(key => {
        let value = med[key] || '';
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
    link.setAttribute('download', 'medecins_approuves.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.exportingApprouves = false;
  }

  // ──────────────────────────────
  // Export CSV - Médecins en attente
  // ──────────────────────────────
  exportEnAttenteToCSV() {
    if (this.medecinsEnAttente.length === 0) {
      alert('Aucun médecin en attente à exporter.');
      return;
    }

    this.exportingEnAttente = true;

    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité', 'RPPS', 'Adresse Hôpital', 'Date inscription', 'Sexe'];
    const keys: (keyof User)[] = [
      'nom','prenom','email','telephone','specialite','rpps','adresseHopital','dateInscription','sexe'
    ];

    const csvRows = [headers.join(',')];

    for (const med of this.medecinsEnAttente) {
      const values = keys.map(key => {
        let value = med[key] || '';
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
    link.setAttribute('download', 'medecins_en_attente.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.exportingEnAttente = false;
  }

  // ──────────────────────────────
  // Import - Médecins approuvés
  // ──────────────────────────────
  triggerFileInputApprouves() {
    this.fileInputApprouves.nativeElement.click();
  }

  onFileSelectedApprouves(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.importingApprouves = true;

    this.userService.importMedecins(file, 'approuve').subscribe({
      next: (response) => {
        this.importingApprouves = false;
        const message = `Import réussi ! ${response.successCount} médecins importés avec le statut "approuvé".`;
        if (response.failedCount > 0) {
          alert(message + `\n${response.failedCount} lignes en erreur.`);
        } else {
          alert(message);
        }
        this.loadMedecins();
        this.loadMedecinsEnAttente();
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

  // ──────────────────────────────
  // Import - Médecins en attente
  // ──────────────────────────────
  triggerFileInputEnAttente() {
    this.fileInputEnAttente.nativeElement.click();
  }

  onFileSelectedEnAttente(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.importingEnAttente = true;

    this.userService.importMedecins(file, 'en_attente').subscribe({
      next: (response) => {
        this.importingEnAttente = false;
        const message = `Import réussi ! ${response.successCount} médecins importés avec le statut "en attente".`;
        if (response.failedCount > 0) {
          alert(message + `\n${response.failedCount} lignes en erreur.`);
        } else {
          alert(message);
        }
        this.loadMedecins();
        this.loadMedecinsEnAttente();
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