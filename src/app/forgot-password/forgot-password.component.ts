// src/app/forgot-password/forgot-password.component.ts
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
  successMessage = '';
  isLoading = false;
  emailSent = false;

  constructor(
    private verificationService: VerificationService,
    private router: Router
  ) {}

  async requestReset() {
    this.errorMessage = '';
    this.successMessage = '';

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

      this.emailSent = true;
      this.successMessage = response.message || 'Un email de réinitialisation a été envoyé si ce compte existe.';

    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Une erreur est survenue';
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}