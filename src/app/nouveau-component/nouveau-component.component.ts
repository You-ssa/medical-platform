import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nouveau-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nouveau-component.component.html',
  styleUrls: ['./nouveau-component.component.css']
})
export class NouveauComponentComponent implements OnInit {
  patientName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Récupérer le nom du patient connecté
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientName = user.nom || 'Patient';
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}