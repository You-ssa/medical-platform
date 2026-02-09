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

// 🆕 Nouveaux imports
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { GestionPatientsComponent } from './admin/gestion-patients/gestion-patients.component';
import { GestionMedecinsComponent } from './admin/gestion-medecins/gestion-medecins.component';

export const routes: Routes = [
  // Page d'accueil
  { path: '', component: AccueilComponent },
  
  // Pages publiques
  { path: 'explorer', component: ExplorerComponent },
  { path: 'a-propos', component: AProposComponent },
  { path: 'welcome', component: WelcomeComponent },
  
  // Authentification
  { path: 'login', component: LoginComponent },
  
  // Inscriptions
  { path: 'register', component: RegisterComponent },
  { path: 'register-med', component: RegisterMedComponent },
  { path: 'register-sec', component: RegisterSecComponent },
  
  // Espaces utilisateurs
  { path: 'home-user', component: HomeUserComponent },
  { path: 'home-med', component: HomeMedComponent },
  { path: 'home-sec', component: HomeSecComponent },
  
  // 🆕 Admin - Routes mises à jour
  { 
    path: 'admin', 
    children: [
      { path: '', component: AdminComponent },  // Liste des demandes (ancien admin)
      { path: 'dashboard', component: DashboardComponent },  // Nouveau dashboard
      { path: 'gestion-patients', component: GestionPatientsComponent },
      { path: 'gestion-medecins', component: GestionMedecinsComponent }
    ]
  },
  { path: 'init-admin', component: InitAdminComponent },
  
  // Redirection 404
  { path: '**', redirectTo: '' }
];