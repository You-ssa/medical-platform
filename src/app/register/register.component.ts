// src/app/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { PaysService, Pays } from '../services/pays.service';
import { VerificationService } from '../services/verification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // Formulaire multi-étapes
  currentStep = 1;
  totalSteps = 4; // ✅ CHANGÉ de 3 à 4

  // Données du formulaire
  nom = '';
  prenom = '';
  sexe = '';
  email = '';
  pays = '';
  ville = '';
  telephone = '';
  motDePasse = '';
  confMotDePasse = '';
  acceptConditions = false;

  // ✅ NOUVEAU : Vérification email
  verificationCode = '';
  codeSent = false;
  codeVerified = false;
  resendCooldown = 0;
  resendInterval: any;

  // Photo
  photoFile?: File;
  photoPreview?: string;

  // Listes pour les sélections
  paysList: Pays[] = [];
  villesList: string[] = [];
  
  // Données téléphone
  phonePrefix = '';
  phoneHelpText = '';

  // Messages
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  dataLoading = true;

  constructor(
    private userService: UserService,
    private paysService: PaysService,
    private verificationService: VerificationService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadPays();
  }

  ngOnDestroy() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  // Charger la liste des pays
  async loadPays() {
    try {
      this.dataLoading = true;
      this.paysList = await this.paysService.getPays();
      console.log(`✅ ${this.paysList.length} pays chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement pays:', error);
      this.errorMessage = 'Erreur lors du chargement des données';
    } finally {
      this.dataLoading = false;
    }
  }

  // Étapes
  nextStep() {
    // ✅ Validation avant passage à l'étape suivante
    if (this.currentStep === 1) {
      if (!this.nom || !this.prenom || !this.sexe) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        return;
      }
    }

    if (this.currentStep === 2) {
      if (!this.email || !this.pays || !this.ville || !this.telephone) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        return;
      }
    }

    if (this.currentStep === 3) {
      if (!this.motDePasse || !this.confMotDePasse) {
        this.errorMessage = 'Veuillez remplir tous les champs';
        return;
      }
      if (this.motDePasse !== this.confMotDePasse) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        return;
      }
      if (!this.acceptConditions) {
        this.errorMessage = 'Vous devez accepter les conditions';
        return;
      }

      // ✅ Envoyer le code automatiquement en arrivant à l'étape 4
      this.sendVerificationCode();
    }

    this.errorMessage = '';
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.errorMessage = '';
      this.currentStep--;
    }
  }

  // Gérer le changement de pays
  onPaysChange() {
    const selectedPays = this.paysList.find(p => p.nom === this.pays);
    if (selectedPays) {
      this.villesList = selectedPays.villes || [];
      this.phonePrefix = selectedPays.indicatif;
      this.phoneHelpText = `Format: ${selectedPays.formatTel || 'XX XXX XXX'}`;
      this.ville = '';
    } else {
      this.villesList = [];
      this.phonePrefix = '';
      this.phoneHelpText = '';
    }
  }

  // Gérer la sélection de photo
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => this.photoPreview = e.target.result;
      reader.readAsDataURL(this.photoFile);
    }
  }

  // ✅ NOUVEAU : Envoyer le code de vérification
  async sendVerificationCode() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      await this.verificationService.sendVerificationCode(this.email, 'patient');
      
      this.codeSent = true;
      this.successMessage = 'Code envoyé à votre email !';
      this.startResendCooldown();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Erreur lors de l\'envoi du code';
    } finally {
      this.isLoading = false;
    }
  }

  // ✅ NOUVEAU : Renvoyer le code
  async resendCode() {
    if (this.resendCooldown > 0) return;
    await this.sendVerificationCode();
  }

  // ✅ NOUVEAU : Cooldown de 60 secondes
  startResendCooldown() {
    this.resendCooldown = 60;
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  // ✅ NOUVEAU : Vérifier le code saisi
  async verifyCode() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.errorMessage = 'Veuillez saisir le code à 6 chiffres';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      await this.verificationService.verifyCode(
        this.email,
        this.verificationCode,
        'patient'
      );

      this.codeVerified = true;
      this.successMessage = '✓ Code vérifié ! Inscription en cours...';

      // Procéder à l'inscription
      setTimeout(() => {
        this.registerPatient();
      }, 1000);

    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Code incorrect ou expiré';
      this.isLoading = false;
    }
  }

  // Inscription patient (appelée après vérification du code)
  async registerPatient() {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const user: User = {
        nom: this.nom,
        prenom: this.prenom,
        sexe: this.sexe,
        email: this.email,
        pays: this.pays,
        ville: this.ville,
        telephone: this.phonePrefix + this.telephone,
        motDePasse: this.motDePasse,
        userType: 'patient',
        dateInscription: new Date().toISOString()
      };

      await this.userService.createPatient(user, this.photoFile);

      this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';
      setTimeout(() => this.router.navigate(['/login']), 2000);

    } catch (error) {
      const msg = (error as HttpErrorResponse)?.error?.message || 'Une erreur est survenue lors de l\'inscription';
      this.errorMessage = msg;
      this.codeVerified = false; // Permettre une nouvelle tentative
    } finally {
      this.isLoading = false;
    }
  }

  goToRegisterMedecin() {
    this.router.navigate(['/register-med']);
  }

  goToRegisterSecretaire() {
    this.router.navigate(['/register-sec']);
  }
}