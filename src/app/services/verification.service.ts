// src/app/services/verification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Envoyer un code de vérification
   */
  async sendVerificationCode(email: string, userType: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/api/verification/send-code`, {
        email,
        userType
      })
    );
  }

  /**
   * Vérifier un code
   */
  async verifyCode(email: string, code: string, userType: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/api/verification/verify-code`, {
        email,
        code,
        userType
      })
    );
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string, userType: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/api/password-reset/request`, {
        email,
        userType
      })
    );
  }

  /**
   * Vérifier un token de réinitialisation
   */
  async verifyResetToken(token: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.apiUrl}/api/password-reset/verify-token/${token}`)
    );
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/api/password-reset/reset`, {
        token,
        newPassword
      })
    );
  }
}