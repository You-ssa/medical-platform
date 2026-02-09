import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../../services/stats.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-gestion-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './gestion-medecins.component.html',
  styleUrls: ['./gestion-medecins.component.css']
})
export class GestionMedecinsComponent implements OnInit {
  medecins: any[] = [];
  filteredMedecins: any[] = [];
  searchTerm: string = '';
  filterSpecialite: string = '';
  loading = true;
  selectedMedecin: any = null;

  specialites: string[] = [
    'Cardiologie',
    'Pédiatrie',
    'Neurologie',
    'Dermatologie',
    'Orthopédie',
    'Ophtalmologie',
    'ORL',
    'Psychiatrie',
    'Radiologie',
    'Urgences'
  ];

  constructor(
    private statsService: StatsService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.loadMedecins();
  }

  async loadMedecins() {
    try {
      this.loading = true;
      this.medecins = await this.statsService.getMedecinsList();
      this.filteredMedecins = this.medecins;
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    } finally {
      this.loading = false;
    }
  }

  searchMedecins() {
    this.applyFilters();
  }

  filterBySpecialite() {
    this.applyFilters();
  }

  applyFilters() {
    let result = this.medecins;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(medecin =>
        medecin.nom.toLowerCase().includes(term) ||
        medecin.prenom.toLowerCase().includes(term) ||
        medecin.email.toLowerCase().includes(term) ||
        medecin.specialite.toLowerCase().includes(term)
      );
    }

    if (this.filterSpecialite) {
      result = result.filter(medecin =>
        medecin.specialite === this.filterSpecialite
      );
    }

    this.filteredMedecins = result;
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      try {
        await this.userService.refuserUtilisateur(id, 'medecin');
        await this.loadMedecins();
        alert('Médecin supprimé avec succès');
      } catch (error) {
        console.error('Erreur suppression médecin:', error);
        alert('Erreur lors de la suppression');
      }
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getSpecialiteCount(specialite: string): number {
    return this.medecins.filter(m => m.specialite === specialite).length;
  }
}