import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { VerificationService } from '../services/verification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  userType: 'patient' | 'medecin' | 'secretaire' | 'admin' = 'patient';
  
  errorMessage = '';
  isLoading = false;
  emailSent = false;

  constructor(
    private verificationService: VerificationService,
    private router: Router
  ) {}

  async requestReset() {
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Veuillez saisir votre adresse email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez saisir une adresse email valide';
      return;
    }

    this.isLoading = true;

    try {
      const response = await this.verificationService.requestPasswordReset(
        this.email,
        this.userType
      );

      // Vérifier si l'email existe ou non
      if (response.exists === false) {
        this.errorMessage = `Cette adresse email n'existe pas pour un compte ${this.getUserTypeLabel()}`;
        this.emailSent = false;
      } else {
        this.emailSent = true;
        // Nous n'utilisons plus successMessage dans le template
        // mais nous gardons la réponse pour le log
        console.log('Password reset email sent:', response.message);
      }

    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
      this.emailSent = false;
    } finally {
      this.isLoading = false;
    }
  }

  // Méthode pour obtenir le label de l'utilisateur en français
  getUserTypeLabel(): string {
    const labels = {
      'patient': 'Patient',
      'medecin': 'Médecin',
      'secretaire': 'Secrétaire',
      'admin': 'Administrateur'
    };
    return labels[this.userType] || 'Utilisateur';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}