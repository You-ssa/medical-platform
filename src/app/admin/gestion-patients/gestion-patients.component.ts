import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { StatsService } from '../../services/stats.service';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-gestion-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './gestion-patients.component.html',
  styleUrls: ['./gestion-patients.component.css']
})
export class GestionPatientsComponent implements OnInit {
  patients: User[] = [];
  filteredPatients: User[] = [];
  searchTerm: string = '';
  loading = true;
  selectedPatient: User | null = null;

  constructor(private statsService: StatsService) {}

  async ngOnInit() {
    await this.loadPatients();
  }

  async loadPatients() {
    try {
      this.loading = true;
      this.patients = await this.statsService.getPatientsList();
      this.filteredPatients = this.patients;
    } catch (error) {
      console.error('Erreur chargement patients:', error);
    } finally {
      this.loading = false;
    }
  }

  searchPatients() {
    if (!this.searchTerm) {
      this.filteredPatients = this.patients;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.nom.toLowerCase().includes(term) ||
      patient.prenom.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.telephone.includes(term)
    );
  }

  viewPatient(patient: User) {
    this.selectedPatient = patient;
    document.body.style.overflow = 'hidden';
  }

  closePatientDetail() {
    this.selectedPatient = null;
    document.body.style.overflow = 'auto';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}