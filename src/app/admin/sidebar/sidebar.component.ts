import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <i class="fas fa-hospital"></i>
        <h2>Admin CHU</h2>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <i class="fas fa-th-large"></i>
          <span>Tableau de Bord</span>
        </a>

        <a routerLink="/admin/gestion-patients" routerLinkActive="active" class="nav-item">
          <i class="fas fa-users"></i>
          <span>Gestion des Patients</span>
        </a>

        <a routerLink="/admin/gestion-medecins" routerLinkActive="active" class="nav-item">
          <i class="fas fa-user-md"></i>
          <span>Gestion des Médecins</span>
        </a>

        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          <i class="fas fa-user-check"></i>
          <span>Administration CHU</span>
        </a>

        <a routerLink="/admin/notifications" routerLinkActive="active" class="nav-item">
          <i class="fas fa-bell"></i>
          <span>Notifications</span>
          <span class="badge" *ngIf="notificationCount > 0">{{notificationCount}}</span>
        </a>

        <a routerLink="/admin/consultations" routerLinkActive="active" class="nav-item">
          <i class="fas fa-calendar-check"></i>
          <span>Consultations</span>
        </a>

        <div class="nav-item expandable" [class.expanded]="dossiersExpanded" (click)="dossiersExpanded = !dossiersExpanded">
          <i class="fas fa-folder-open"></i>
          <span>Dossiers Médicaux</span>
          <i class="fas fa-chevron-down expand-icon"></i>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: linear-gradient(180deg, #2c5282 0%, #1a365d 100%);
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
      box-shadow: 4px 0 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .sidebar-header {
      padding: 25px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.2);
    }

    .sidebar-header i {
      font-size: 28px;
      color: #63b3ed;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .sidebar-nav {
      padding: 20px 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
      padding-left: 25px;
    }

    .nav-item.active {
      background: rgba(99, 179, 237, 0.2);
      color: white;
      border-left: 4px solid #63b3ed;
    }

    .nav-item i {
      font-size: 18px;
      width: 20px;
      text-align: center;
    }

    .nav-item span {
      font-size: 14px;
      font-weight: 500;
    }

    .badge {
      margin-left: auto;
      background: #fc8181;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .expandable .expand-icon {
      margin-left: auto;
      transition: transform 0.3s ease;
      font-size: 12px;
    }

    .expandable.expanded .expand-icon {
      transform: rotate(180deg);
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.1);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 3px;
    }
  `]
})
export class SidebarComponent {
  notificationCount = 12;
  dossiersExpanded = false;

  constructor(private router: Router) {}
}