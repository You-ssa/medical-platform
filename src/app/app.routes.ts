import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
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

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'a-propos', component: AProposComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-med', component: RegisterMedComponent },
  { path: 'register-sec', component: RegisterSecComponent },
  { path: 'home-user', component: HomeUserComponent },
  { path: 'home-med', component: HomeMedComponent },
  { path: 'home-sec', component: HomeSecComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin',
    children: [
      { path: '', component: AdminComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'gestion-patients', component: GestionPatientsComponent },
      { path: 'gestion-medecins', component: GestionMedecinsComponent },
      { path: 'gestion-secretaires', component: GestionSecretairesComponent },
      { path: 'gestion-sousadmin', component: GestionSousAdminComponent },
      { path: 'liste-avis', component: ListeAvisComponent }  // ← ajouté
    ]
  },
  { path: 'init-admin', component: InitAdminComponent },
  {
    path: 'patient',
    children: [
      { path: 'profil', component: PatientProfileComponent },
      { path: 'dossier-medical', component: DossierMedicalComponent },
      { path: '', redirectTo: 'profil', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];