import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-init-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './init-admin.component.html',
  styleUrls: ['./init-admin.component.css']
})
export class InitAdminComponent implements OnInit {
  adminExists = false;
  created = false;

  adminEmail = 'admin@votresite.com';
  adminPassword = 'Admin123!';
  adminNom = 'Admin';
  adminPrenom = 'Principal';
  adminTelephone = '+216 00 000 000';
  errorMessage = '';

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.checkAdminExists();
  }

  async checkAdminExists() {
    try {
      this.adminExists = await this.userService.adminExists();
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      this.errorMessage = 'Erreur lors de la vérification de l\'administrateur';
    }
  }

  async createFirstAdmin() {
    this.errorMessage = '';
    try {
      if (!this.adminEmail || !this.adminPassword || !this.adminNom || !this.adminPrenom) {
        alert('Veuillez remplir tous les champs');
        return;
      }

      if (this.adminPassword.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      const admin: User = {
        nom: this.adminNom,
        prenom: this.adminPrenom,
        email: this.adminEmail,
        telephone: this.adminTelephone,
        motDePasse: this.adminPassword,
        userType: 'admin',
        role: 'principal',  // ← on ajoute le rôle principal
        dateInscription: new Date().toISOString()
      };

      await this.userService.createAdmin(admin);
      this.created = true;
      this.adminExists = true;

    } catch (error) {
      console.error('Erreur création admin:', error);
      this.errorMessage = 'Erreur lors de la création de l\'administrateur';
    }
  }
}