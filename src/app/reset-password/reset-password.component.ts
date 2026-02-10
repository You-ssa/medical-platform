// src/app/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { VerificationService } from '../services/verification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  tokenValid = false;
  tokenVerified = false;
  passwordReset = false;

  email = '';
  userType = '';

  constructor(
    private verificationService: VerificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.verifyToken();
      } else {
        this.errorMessage = 'Lien invalide. Aucun token fourni.';
      }
    });
  }

  async verifyToken() {
    this.isLoading = true;

    try {
      const response = await this.verificationService.verifyResetToken(this.token);
      
      this.tokenValid = response.valid;
      this.tokenVerified = true;
      this.email = response.email;
      this.userType = response.userType;

    } catch (error: any) {
      this.tokenValid = false;
      this.tokenVerified = true;
      this.errorMessage = error?.error?.message || 'Lien invalide ou expiré';
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;

    try {
      await this.verificationService.resetPassword(this.token, this.newPassword);

      this.passwordReset = true;
      this.successMessage = 'Mot de passe réinitialisé avec succès !';

      // Redirection après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);

    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Une erreur est survenue lors de la réinitialisation';
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}