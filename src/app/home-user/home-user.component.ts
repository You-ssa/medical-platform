import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../services/patient.service';
import { Patient, RendezVous, PatientNotification, DashboardStats } from '../models/patient.model';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent implements OnInit {
  patient: Patient | null = null;
  stats: DashboardStats = {
    prochains_rdv: 0,
    consultations_totales: 0,
    documents_medicaux: 0,
    notifications_non_lues: 0
  };

  prochainsRendezVous: RendezVous[] = [];
  recentNotifications: PatientNotification[] = [];
  loading = true;
  activeMenu = 'dashboard';

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
  }

  loadPatientData(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      console.warn('Aucun utilisateur connecte');
      this.loading = false;
      return;
    }

    const user = JSON.parse(currentUser);
    const rawId = user.id ?? user._id;
    const patientId = (typeof rawId === 'string' && !Number.isNaN(Number(rawId)))
      ? Number(rawId)
      : rawId;

    // Pre-remplir pour afficher immediatement nom/prenom/avatar
    this.patient = {
      ...user,
      id: patientId,
      photo_base64: user.photo_base64 ?? user.photoBase64
    };

    if (!patientId || Number.isNaN(patientId)) {
      console.warn('Aucun identifiant patient trouve dans la session');
      this.loading = false;
      return;
    }

    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = {
          ...this.patient,
          ...patient,
          photo_base64: patient.photo_base64 ?? this.patient?.photo_base64
        };
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur chargement patient', err);
        this.loading = false;
      }
    });
  }

  getPatientAvatar(): string {
    const photo = this.patient?.photo_base64 ?? (this.patient as any)?.photoBase64;
    if (photo) {
      return 'data:image/jpeg;base64,' + photo;
    }

    if (this.patient) {
      const initials = (this.patient.prenom?.charAt(0) || '') + (this.patient.nom?.charAt(0) || '');
      return `https://via.placeholder.com/150/007bff/ffffff?text=${initials}`;
    }

    return 'https://via.placeholder.com/150?text=Avatar';
  }

  loadDashboardData(): void {
    if (!this.patient?.id) {
      this.loading = false;
      return;
    }

    this.patientService.getDashboardStats(this.patient.id).subscribe({
      next: (stats) => this.stats = stats,
      error: () => {}
    });

    this.patientService.getRendezVous(this.patient.id).subscribe({
      next: (rdvs) => {
        this.prochainsRendezVous = rdvs
          .filter(r => new Date(r.date_rdv) >= new Date())
          .sort((a, b) => new Date(a.date_rdv).getTime() - new Date(b.date_rdv).getTime())
          .slice(0, 3);
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.patientService.getNotifications(this.patient.id).subscribe({
      next: (notifications) => {
        this.recentNotifications = notifications
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 5);
      },
      error: () => {}
    });
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusBadgeClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      planifie: 'badge-warning',
      confirme: 'badge-success',
      termine: 'badge-info',
      annule: 'badge-danger'
    };
    return statusMap[statut] || 'badge-primary';
  }

  getNotificationIcon(type_notification: string): string {
    const iconMap: { [key: string]: string } = {
      rendez_vous: 'RDV',
      resultat: 'RES',
      prescription: 'RX',
      document: 'DOC',
      rappel: 'RAP'
    };
    return iconMap[type_notification] || 'NOTIF';
  }

  markNotificationAsRead(notification: PatientNotification): void {
    if (notification.id) {
      this.patientService.markNotificationAsRead(notification.id).subscribe({
        next: () => notification.lue = true,
        error: (err) => console.error('Erreur marquage notification:', err)
      });
    }
  }
}
