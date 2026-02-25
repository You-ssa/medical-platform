import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-register-sec',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-sec.component.html',
  styleUrls: ['./register-sec.component.css']
})
export class RegisterSecComponent implements OnInit {
  // Données du formulaire
  nom = '';
  prenom = '';
  sexe = '';
  email = '';
  telephone = '';
  specialite_id: number | null = null;   // ← maintenant c'est un ID
  adresseHopital = '';
  poste = '';
  departement = '';
  motDePasse = '';
  confMotDePasse = '';
  acceptConditions = false;

  // Photo
  photoFile?: File;
  photoPreview?: string;

  // Messages
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Liste des spécialités chargée depuis le backend
  specialites: any[] = [];

  // Listes statiques pour poste et département (inchangées)
  postes = [
    'Secrétaire médical(e)',
    'Secrétaire administratif(ve)',
    'Assistant(e) médical(e)',
    'Gestionnaire de cabinet',
    'Responsable accueil',
    'Autre'
  ];

  departements = [
    'Accueil',
    'Cardiologie',
    'Chirurgie',
    'Consultation',
    'Dermatologie',
    'Gynécologie',
    'Pédiatrie',
    'Radiologie',
    'Urgences',
    'Administration',
    'Autre'
  ];

  // Gestion des étapes
  currentStep = 1;
  totalSteps = 4;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSpecialites();   // ← charger les spécialités au démarrage
  }

  // Charger les spécialités depuis le service
  loadSpecialites() {
    this.userService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des spécialités';
      }
    });
  }

  // Navigation entre les étapes
  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Gestion de la sélection de la photo
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }

  // Inscription de la secrétaire
  async registerSec() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation des champs obligatoires
    if (!this.nom || !this.prenom || !this.sexe || !this.email ||
        !this.telephone || !this.specialite_id || !this.adresseHopital ||
        !this.poste || !this.departement || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      this.isLoading = false;
      return;
    }

    // Vérification correspondance mots de passe
    if (this.motDePasse !== this.confMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.isLoading = false;
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      this.isLoading = false;
      return;
    }

    // Acceptation des conditions
    if (!this.acceptConditions) {
      this.errorMessage = 'Vous devez accepter les conditions d\'utilisation';
      this.isLoading = false;
      return;
    }

    // Vérifier si l'email existe déjà
    if (await this.userService.emailExists(this.email, 'secretaire')) {
      this.errorMessage = 'Cet email est déjà utilisé';
      this.isLoading = false;
      return;
    }

    try {
      // Construction de l'objet utilisateur
      const user: User = {
        nom: this.nom,
        prenom: this.prenom,
        sexe: this.sexe,
        email: this.email,
        telephone: this.telephone,
        specialite_id: this.specialite_id,   // ← on envoie l'ID
        adresseHopital: this.adresseHopital,
        poste: this.poste,
        departement: this.departement,
        motDePasse: this.motDePasse,
        userType: 'secretaire',
        statut: 'en_attente',
        dateInscription: new Date().toISOString()
      };

      await this.userService.createSecretaire(user, this.photoFile);

      this.successMessage = 'Demande d\'inscription envoyée ! Votre compte sera activé après validation par l\'administrateur.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 4000);

    } catch (error) {
      console.error('Erreur inscription secrétaire:', error);
      const msg = (error as any)?.error?.message || 'Une erreur est survenue lors de l\'inscription';
      this.errorMessage = msg;
    } finally {
      this.isLoading = false;
    }
  }

  // Redirections vers les autres types d'inscription
  goToRegisterPatient() {
    this.router.navigate(['/register']);
  }

  goToRegisterMedecin() {
    this.router.navigate(['/register-med']);
  }
}