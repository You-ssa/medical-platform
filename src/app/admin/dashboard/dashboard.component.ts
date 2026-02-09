import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CardStatComponent } from '../card-stat/card-stat.component';
import { StatsService, Statistics } from '../../services/stats.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, CardStatComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: Statistics = {
    totalPatients: 0,
    totalMedecins: 0,
    totalSecretaires: 0,
    demandesEnAttente: 0,
    consultationsMensuelles: 0,
    tauxUtilisation: 0,
    nouvellesNotifications: 0
  };

  recentPatients: User[] = [];
  recentMedecins: any[] = [];
  loading = true;

  constructor(
    private statsService: StatsService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      
      // Charger les statistiques
      this.stats = await this.statsService.getStatistics();
      
      // Charger les patients récents (derniers 3)
      const allPatients = await this.statsService.getPatientsList();
      this.recentPatients = allPatients.slice(0, 3);
      
      // Charger les médecins (derniers 3)
      const allMedecins = await this.statsService.getMedecinsList();
      this.recentMedecins = allMedecins.slice(0, 3);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * ✅ Méthode pour afficher un message "Bientôt disponible"
   */
  comingSoon(feature: string): void {
    alert(`🚧 ${feature}\n\nCette fonctionnalité sera bientôt disponible !`);
  }
}