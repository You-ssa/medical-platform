import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY  = 'currentUser';
  private readonly ROLE_KEY  = 'userType';

  constructor(private router: Router) {}

  // Sauvegarder la session après login
  saveSession(user: User, token?: string): void {
    // S'assurer que l'objet user contient toutes les infos nécessaires
    // Notamment, pour un admin, le champ 'role' doit être présent (principal/sous-admin)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ROLE_KEY, user.userType);
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    console.log('✅ Session sauvegardée:', { id: user.id, role: user.role, userType: user.userType });
  }

  // Récupérer l'utilisateur courant
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // ✅ Alias utilisé par gestion-sousadmin pour récupérer l'admin connecté
  getCurrentAdmin(): { id: string; role: string } | null {
    const user = this.getCurrentUser();
    if (!user || user.userType !== 'admin') return null;

    // Si le rôle n'est pas défini (cas improbable), on tente de le récupérer depuis user.role ou on log une erreur
    const role = user.role || '';
    if (!role) {
      console.warn('Attention: le rôle de l\'admin est manquant dans les données utilisateur stockées.');
    }

    return {
      id:   String(user.id ?? ''),
      role: role
    };
  }

  // Récupérer le type d'utilisateur (patient / medecin / secretaire / admin)
  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  // Récupérer le token JWT
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Vérifier si connecté
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  // Vérifier si admin principal
  isPrincipal(): boolean {
    return this.getCurrentAdmin()?.role === 'principal';
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.router.navigate(['/login']);
  }

  // Vérifier accès par rôle
  hasRole(...roles: string[]): boolean {
    const role = this.getUserRole();
    return role ? roles.includes(role) : false;
  }
}