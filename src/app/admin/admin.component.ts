import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // 🆕 Ajoutez RouterModule
import { UserService, User } from '../services/user.service';
import { ProfilDetailComponent } from '../profil-detail/profil-detail.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfilDetailComponent], // 🆕 RouterModule
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'medecins' | 'secretaires' | 'admins' = 'medecins';
  
  medecinsEnAttente: User[] = [];
  secretairesEnAttente: User[] = [];
  
  // Utilisateur sélectionné pour affichage du profil détaillé
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
    // Vérifier si l'utilisateur est admin
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    // Charger les données initiales
    await this.loadMedecinsEnAttente();
    await this.loadSecretairesEnAttente();
  }

  /**
   * Charger les médecins en attente
   */
  async loadMedecinsEnAttente() {
    try {
      console.log('Chargement des médecins en attente...');
      this.medecinsEnAttente = await this.userService.getUtilisateursEnAttente('medecin');
      console.log('Médecins en attente:', this.medecinsEnAttente);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      this.medecinsEnAttente = [];
    }
  }

  /**
   * Charger les secrétaires en attente
   */
  async loadSecretairesEnAttente() {
    try {
      console.log('Chargement des secrétaires en attente...');
      this.secretairesEnAttente = await this.userService.getUtilisateursEnAttente('secretaire');
      console.log('Secrétaires en attente:', this.secretairesEnAttente);
    } catch (error) {
      console.error('Erreur lors du chargement des secrétaires:', error);
      this.secretairesEnAttente = [];
    }
  }

  /**
   * Afficher le profil détaillé d'un utilisateur
   */
  showProfilDetail(user: User) {
    this.selectedUser = user;
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fermer le profil détaillé
   */
  closeProfilDetail() {
    this.selectedUser = null;
    // Réactiver le scroll du body
    document.body.style.overflow = 'auto';
  }

  /**
   * Gérer l'approbation depuis le profil détaillé
   */
  async handleApprove(user: User) {
    if (!user.id) return;

    try {
      if (user.userType === 'medecin') {
        await this.approuverMedecin(user.id);
      } else if (user.userType === 'secretaire') {
        await this.approuverSecretaire(user.id);
      }
      this.closeProfilDetail();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  }

  /**
   * Gérer le refus depuis le profil détaillé
   */
  async handleReject(user: User) {
    if (!user.id) return;

    try {
      if (user.userType === 'medecin') {
        await this.refuserMedecin(user.id);
      } else if (user.userType === 'secretaire') {
        await this.refuserSecretaire(user.id);
      }
      this.closeProfilDetail();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  }

  /**
   * Approuver un médecin
   */
  async approuverMedecin(id: string) {
    if (!id) {
      alert('ID du médecin invalide');
      return;
    }

    try {
      console.log('Approbation du médecin:', id);
      await this.userService.approuverUtilisateur(id, 'medecin');
      await this.loadMedecinsEnAttente();
      alert('Médecin approuvé avec succès !');
    } catch (error) {
      console.error('Erreur approbation médecin:', error);
      alert('Erreur lors de l\'approbation. Veuillez réessayer.');
    }
  }

  /**
   * Refuser un médecin
   */
  async refuserMedecin(id: string) {
    if (!id) {
      alert('ID du médecin invalide');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir refuser ce médecin ?')) {
      try {
        console.log('Refus du médecin:', id);
        await this.userService.refuserUtilisateur(id, 'medecin');
        await this.loadMedecinsEnAttente();
        alert('Médecin refusé');
      } catch (error) {
        console.error('Erreur refus médecin:', error);
        alert('Erreur lors du refus. Veuillez réessayer.');
      }
    }
  }

  /**
   * Approuver un(e) secrétaire
   */
  async approuverSecretaire(id: string) {
    if (!id) {
      alert('ID du/de la secrétaire invalide');
      return;
    }

    try {
      console.log('Approbation du/de la secrétaire:', id);
      await this.userService.approuverUtilisateur(id, 'secretaire');
      await this.loadSecretairesEnAttente();
      alert('Secrétaire approuvé(e) avec succès !');
    } catch (error) {
      console.error('Erreur approbation secrétaire:', error);
      alert('Erreur lors de l\'approbation. Veuillez réessayer.');
    }
  }

  /**
   * Refuser un(e) secrétaire
   */
  async refuserSecretaire(id: string) {
    if (!id) {
      alert('ID du/de la secrétaire invalide');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir refuser ce/cette secrétaire ?')) {
      try {
        console.log('Refus du/de la secrétaire:', id);
        await this.userService.refuserUtilisateur(id, 'secretaire');
        await this.loadSecretairesEnAttente();
        alert('Secrétaire refusé(e)');
      } catch (error) {
        console.error('Erreur refus secrétaire:', error);
        alert('Erreur lors du refus. Veuillez réessayer.');
      }
    }
  }

  /**
   * Ajouter un administrateur
   */
  async ajouterAdmin() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      // Validation
      if (!this.newAdmin.nom || !this.newAdmin.prenom || !this.newAdmin.email || 
          !this.newAdmin.telephone || !this.newAdmin.motDePasse) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        this.isLoading = false;
        return;
      }

      if (this.newAdmin.motDePasse !== this.newAdmin.confMotDePasse) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        this.isLoading = false;
        return;
      }

      // Vérifier si l'email existe
      const emailExists = await this.userService.emailExists(this.newAdmin.email, 'admin');
      if (emailExists) {
        this.errorMessage = 'Cet email est déjà utilisé';
        this.isLoading = false;
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
      
      // Reset form
      this.newAdmin = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        motDePasse: '',
        confMotDePasse: ''
      };

    } catch (error) {
      console.error('Erreur création admin:', error);
      this.errorMessage = 'Erreur lors de la création. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Formater une date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    this.router.navigate(['/login']);
  }
}