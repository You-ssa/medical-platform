import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { ProfilDetailComponent } from '../profil-detail/profil-detail.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfilDetailComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'secretaires' | 'admins' = 'secretaires';

  secretairesEnAttente: User[] = [];
  selectedUser: User | null = null;

  newAdmin = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    confMotDePasse: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    await this.loadSecretairesEnAttente();
  }

  // ══════════════════════════════════════════════════════════
  // Secrétaires en attente
  // ══════════════════════════════════════════════════════════

  async loadSecretairesEnAttente() {
    try {
      this.secretairesEnAttente = await this.userService.getUtilisateursEnAttente('secretaire');
    } catch (error) {
      console.error('Erreur lors du chargement des secrétaires:', error);
      this.secretairesEnAttente = [];
    }
  }

  showProfilDetail(user: User) {
    this.selectedUser = user;
    document.body.style.overflow = 'hidden';
  }

  closeProfilDetail() {
    this.selectedUser = null;
    document.body.style.overflow = 'auto';
  }

  async handleApprove(user: User) {
    if (!user.id) return;
    await this.approuverSecretaire(user.id);
    this.closeProfilDetail();
  }

  async handleReject(user: User) {
    if (!user.id) return;
    await this.refuserSecretaire(user.id);
    this.closeProfilDetail();
  }

  async approuverSecretaire(id: string) {
    if (!id) { alert('ID du/de la secrétaire invalide'); return; }
    try {
      await this.userService.approuverUtilisateur(id, 'secretaire');
      await this.loadSecretairesEnAttente();
      alert('Secrétaire approuvé(e) avec succès !');
    } catch (error) {
      console.error('Erreur approbation secrétaire:', error);
      alert('Erreur lors de l\'approbation. Veuillez réessayer.');
    }
  }

  async refuserSecretaire(id: string) {
    if (!id) { alert('ID du/de la secrétaire invalide'); return; }
    if (confirm('Êtes-vous sûr de vouloir refuser ce/cette secrétaire ?')) {
      try {
        await this.userService.refuserUtilisateur(id, 'secretaire');
        await this.loadSecretairesEnAttente();
        alert('Secrétaire refusé(e).');
      } catch (error) {
        console.error('Erreur refus secrétaire:', error);
        alert('Erreur lors du refus. Veuillez réessayer.');
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // Ajouter un administrateur
  // ══════════════════════════════════════════════════════════

  async ajouterAdmin() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      if (!this.newAdmin.nom || !this.newAdmin.prenom || !this.newAdmin.email ||
          !this.newAdmin.telephone || !this.newAdmin.motDePasse) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        return;
      }

      if (this.newAdmin.motDePasse !== this.newAdmin.confMotDePasse) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        return;
      }

      const emailExists = await this.userService.emailExists(this.newAdmin.email, 'admin');
      if (emailExists) {
        this.errorMessage = 'Cet email est déjà utilisé';
        return;
      }

      const admin: User = {
        nom: this.newAdmin.nom,
        prenom: this.newAdmin.prenom,
        email: this.newAdmin.email,
        telephone: this.newAdmin.telephone,
        motDePasse: this.newAdmin.motDePasse,
        userType: 'admin',
        dateInscription: new Date().toISOString()
      };

      await this.userService.createAdmin(admin);
      this.successMessage = 'Administrateur créé avec succès !';

      this.newAdmin = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '', confMotDePasse: '' };

    } catch (error) {
      console.error('Erreur création admin:', error);
      this.errorMessage = 'Erreur lors de la création. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
    }
  }

  // ══════════════════════════════════════════════════════════
  // Utilitaires
  // ══════════════════════════════════════════════════════════

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    this.router.navigate(['/login']);
  }
}