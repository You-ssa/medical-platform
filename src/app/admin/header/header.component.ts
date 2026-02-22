import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="admin-header">
      <div class="header-left">
        <h1>Bienvenue, Admin</h1>
      </div>

      <div class="header-right">
        <div class="user-menu" (click)="toggleDropdown()">
          <img [src]="adminPhoto" alt="Admin" class="user-avatar">
          <span class="user-name">Admin</span>
          <i class="fas fa-chevron-down"></i>

          <div class="dropdown-menu" *ngIf="showDropdown">
            <a href="#" class="dropdown-item">
              <i class="fas fa-user"></i> Mon Profil
            </a>
            <a href="#" class="dropdown-item">
              <i class="fas fa-cog"></i> Paramètres
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" (click)="logout($event)">
              <i class="fas fa-sign-out-alt"></i> Déconnexion
            </a>
          </div>
        </div>

        <button class="btn-settings">
          <i class="fas fa-cog"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .admin-header {
      height: 70px;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left h1 {
      margin: 0;
      font-size: 22px;
      color: #2d3748;
      font-weight: 600;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      transition: background 0.3s ease;
      position: relative;
    }

    .user-menu:hover {
      background: #f7fafc;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e2e8f0;
    }

    .user-name {
      font-weight: 500;
      color: #2d3748;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-width: 200px;
      overflow: hidden;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #4a5568;
      text-decoration: none;
      transition: background 0.2s ease;
    }

    .dropdown-item:hover {
      background: #f7fafc;
    }

    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 4px 0;
    }

    .btn-settings {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f7fafc;
      border: none;
      color: #4a5568;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-settings:hover {
      background: #e2e8f0;
      transform: rotate(90deg);
    }
  `]
})
export class HeaderComponent implements OnInit {
  showDropdown = false;
  adminPhoto = 'assets/admin.png';

  constructor(private router: Router) {}

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.photoBase64) {
        this.adminPhoto = user.photoBase64;
      }
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout(event: Event) {
    event.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    this.router.navigate(['/login']);
  }
}
