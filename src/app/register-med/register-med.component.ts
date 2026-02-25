import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-register-med',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-med.component.html',
  styleUrls: ['./register-med.component.css']
})
export class RegisterMedComponent implements OnInit {

  userType: 'patient' | 'medecin' | 'secretaire' = 'medecin';

  // Champs du formulaire
  nom = '';
  prenom = '';
  sexe = '';
  specialite_id: number | null = null;   // correspond à l'ID de la spécialité
  specialites: any[] = [];                // liste des spécialités chargées depuis le service
  rpps = '';
  adresseHopital = '';
  email = '';
  telephone = '';
  motDePasse = '';
  confMotDePasse = '';
  acceptConditions = false;

  // Photo
  photoFile?: File;
  photoPreview?: string;

  // État UI
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Étapes
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSpecialites();
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

  // Gestion de la sélection de la photo
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }

  // Navigation entre les étapes
  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Inscription du médecin
  async registerMed() {
    if (this.isLoading) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Vérification des champs obligatoires
    if (!this.nom || !this.prenom || !this.sexe || !this.specialite_id ||
        !this.rpps || !this.adresseHopital || !this.email ||
        !this.telephone || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      this.isLoading = false;
      return;
    }

    if (!this.telephone.trim()) {
      this.errorMessage = 'Le téléphone est obligatoire';
      this.isLoading = false;
      return;
    }

    // Vérification des mots de passe
    if (this.motDePasse !== this.confMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.isLoading = false;
      return;
    }

    // Validation RPPS : 11 chiffres exactement
    if (!/^\d{11}$/.test(this.rpps)) {
      this.errorMessage = 'Le numéro RPPS doit contenir exactement 11 chiffres';
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

    // Vérification si l'email existe déjà
    try {
      const exists = await this.userService.emailExists(this.email, 'medecin');
      if (exists) {
        this.errorMessage = 'Cet email est déjà utilisé';
        this.isLoading = false;
        return;
      }
    } catch {
      this.errorMessage = 'Erreur lors de la vérification de l’email';
      this.isLoading = false;
      return;
    }

    // Construction de l'objet utilisateur
    try {
      const user: User = {
        nom: this.nom,
        prenom: this.prenom,
        sexe: this.sexe,
        specialite_id: this.specialite_id,
        rpps: this.rpps,
        adresseHopital: this.adresseHopital,
        email: this.email,
        telephone: this.telephone,
        motDePasse: this.motDePasse,
        userType: 'medecin',
        statut: 'en_attente',
        dateInscription: new Date().toISOString()
      };

      await this.userService.createMedecin(user, this.photoFile);

      this.successMessage =
        'Demande envoyée avec succès. Votre compte sera activé après validation.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 4000);

    } catch (error: any) {
      console.error('Erreur inscription médecin:', error);
      this.errorMessage =
        error?.error?.message || 'Erreur lors de l’inscription';
    } finally {
      this.isLoading = false;
    }
  }

  // Redirections vers les autres types d'inscription
  goToRegisterPatient() {
    this.router.navigate(['/register']);
  }

  goToRegisterSecretaire() {
    this.router.navigate(['/register-sec']);
  }
}