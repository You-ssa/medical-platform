import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email      = '';
  motDePasse = '';
  userType: 'patient' | 'medecin' | 'secretaire' | 'admin' = 'patient';

  errorMessage = '';
  isLoading    = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.email || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.isLoading = false;
      return;
    }

    try {
      const response: any = await this.userService.login(
        this.email,
        this.motDePasse,
        this.userType
      );

      // Gérer les deux formats : { user, token } ou User direct
      const user: User | null = response?.user ?? response;
      const token: string | undefined = response?.token;

      if (!user || !user.id) {
        this.errorMessage = (this.userType === 'medecin' || this.userType === 'secretaire')
          ? 'Email ou mot de passe incorrect, ou compte en attente d\'approbation'
          : 'Email ou mot de passe incorrect';
        this.isLoading = false;
        return;
      }

      // ✅ Stocke dans localStorage['currentUser'] via AuthService
      this.authService.saveSession(user, token);

      console.log('🔐 Session après login:', this.authService.getCurrentUser());

      this.redirectUser(user.userType);

    } catch (error: any) {
      this.errorMessage =
        error?.error?.message || 'Une erreur est survenue lors de la connexion';
    } finally {
      this.isLoading = false;
    }
  }

  private redirectUser(userType: string) {
    switch (userType) {
      case 'patient':    this.router.navigate(['/home-user']); break;
      case 'medecin':    this.router.navigate(['/home-med']);  break;
      case 'secretaire': this.router.navigate(['/home-sec']);  break;
      case 'admin':      this.router.navigate(['/admin']);     break;
      default:           this.router.navigate(['/']);
    }
  }

  goToRegister() {
    switch (this.userType) {
      case 'patient':    this.router.navigate(['/register']);     break;
      case 'medecin':    this.router.navigate(['/register-med']); break;
      case 'secretaire': this.router.navigate(['/register-sec']); break;
      default:           this.router.navigate(['/register']);
    }
  }

  getImageForUser(): string {
    switch (this.userType) {
      case 'patient':    return 'assets/pat.jpg';
      case 'medecin':    return 'assets/medc.jpg';
      case 'secretaire': return 'assets/secr.jpg';
      case 'admin':      return 'assets/admin.png';
      default:           return 'assets/default.png';
    }
  }

  getPhraseForUser(): string {
    switch (this.userType) {
      case 'patient':    return 'Restez fort et positif, nous sommes là';
      case 'medecin':    return 'Vous êtes l\'espoir de chaque patient';
      case 'secretaire': return 'Accueil chaleureux, travail parfait';
      case 'admin':      return 'Vous êtes le pilier de notre réussite<br>Reste fort';
      default:           return 'Bienvenue';
    }
  }
}