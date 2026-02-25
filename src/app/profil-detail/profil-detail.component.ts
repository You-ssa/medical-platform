import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService, Specialite } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

const DEFAULT_AVATAR = `data:image/svg+xml;charset=UTF-8,
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
<circle cx='60' cy='60' r='60' fill='%23e8edf5'/>
<circle cx='60' cy='45' r='22' fill='%23b0bec5'/>
<ellipse cx='60' cy='105' rx='34' ry='24' fill='%23b0bec5'/>
</svg>`;

@Component({
  selector: 'app-profil-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil-detail.component.html',
  styleUrls: ['./profil-detail.component.css']
})
export class ProfilDetailComponent implements OnInit {

  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<User>();
  @Output() reject = new EventEmitter<User>();

  specialites: Specialite[] = [];

  constructor(private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    await this.loadSpecialites();
  }

  async loadSpecialites() {
    try {
      const result = await firstValueFrom(this.userService.getSpecialites());
      this.specialites = result || [];

      if (this.user && this.user.specialite_id != null) {
        const found = this.specialites.find(
          s => s.id === Number(this.user!.specialite_id)
        );

        if (found) {
          this.user.specialite = found.nom;
          this.user = { ...this.user }; // force refresh Angular
        }
      }

    } catch (err) {
      console.error('Erreur chargement spécialités', err);
      this.specialites = [];
    }
  }

  getPhotoSrc(photoBase64: string | null | undefined): string {
    if (!photoBase64 || photoBase64.trim().length < 10) {
      return DEFAULT_AVATAR;
    }
    if (photoBase64.startsWith('data:image')) {
      return photoBase64;
    }
    return `data:image/jpeg;base64,${photoBase64}`;
  }

  closeModal(): void {
    this.close.emit();
  }

  onApprove(): void {
    if (this.user) {
      this.approve.emit(this.user);
    }
  }

  onReject(): void {
    if (this.user) {
      this.reject.emit(this.user);
    }
  }

  getUserIcon(): string {
    if (!this.user) return 'fas fa-user';
    return this.user.userType === 'medecin'
      ? 'fas fa-user-md'
      : 'fas fa-user-tie';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }
}