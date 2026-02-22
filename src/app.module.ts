import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

// 👇 Tous les autres composants que tu utilises dans les routes
import { RegisterMedComponent } from './register-med/register-med.component';
import { RegisterSecComponent } from './register-sec/register-sec.component';
import { AProposComponent } from './a-propos/a-propos.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { HomeUserComponent } from './home-user/home-user.component';
import { HomeMedComponent } from './home-med/home-med.component';
import { HomeSecComponent } from './home-sec/home-sec.component';
import { AdminComponent } from './admin/admin.component';
import { InitAdminComponent } from './init-admin/init-admin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { DossierMedicalComponent } from './dossier-medical/dossier-medical.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { GestionPatientsComponent } from './admin/gestion-patients/gestion-patients.component';
import { GestionMedecinsComponent } from './admin/gestion-medecins/gestion-medecins.component';
import { GestionSecretairesComponent } from './admin/gestion-secretaire/gestion-secretaire.component';
import { ListeAvisComponent } from './admin/liste-avis/liste-avis.component';
import { GestionSousAdminComponent } from './admin/gestion-sousadmin/gestion-sousadmin.component';

import { routes } from './app.routes'; // ton fichier de routes

@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    ExplorerComponent,
    RegisterComponent,
    LoginComponent,
    RegisterMedComponent,
    RegisterSecComponent,
    AProposComponent,
    WelcomeComponent,
    HomeUserComponent,
    HomeMedComponent,
    HomeSecComponent,
    AdminComponent,
    InitAdminComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    PatientProfileComponent,
    DossierMedicalComponent,
    DashboardComponent,
    GestionPatientsComponent,
    GestionMedecinsComponent,
    GestionSecretairesComponent,
    ListeAvisComponent,
    GestionSousAdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,        // 👈 indispensable pour ngModel / ngForm
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }