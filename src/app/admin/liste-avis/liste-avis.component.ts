import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

interface Avis {
  id: number;
  message: string;
  date_envoi: string;
  lu: boolean;
}

@Component({
  selector: 'app-liste-avis',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './liste-avis.component.html',
  styleUrls: ['./liste-avis.component.css']
})
export class ListeAvisComponent implements OnInit {
  avisList: Avis[] = [];
  isLoading = true;
  erreur = '';

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerAvis();
  }

  chargerAvis(): void {
    this.isLoading = true;
    this.http.get<Avis[]>(`${this.apiUrl}/avis`).subscribe({
      next: (data) => { this.avisList = data; this.isLoading = false; },
      error: () => { this.erreur = 'Erreur lors du chargement des avis.'; this.isLoading = false; }
    });
  }

  supprimerAvis(id: number): void {
    if (!confirm('Supprimer cet avis ?')) return;
    this.http.delete(`${this.apiUrl}/avis/${id}`).subscribe({
      next: () => { this.avisList = this.avisList.filter(a => a.id !== id); },
      error: () => alert('Erreur lors de la suppression.')
    });
  }
}