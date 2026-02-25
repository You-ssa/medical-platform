// specialite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Specialite {
  id: number;
  nom: string;
  description?: string; // optionnel selon le besoin
}

@Injectable({ providedIn: 'root' })
export class SpecialiteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de toutes les spécialités
   * GET /api/specialites
   */
  getSpecialites(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>(`${this.apiUrl}/api/specialites`);
  }

  /**
   * Récupère une spécialité par son ID
   * GET /api/specialites/:id
   */
  getSpecialiteById(id: number): Observable<Specialite> {
    return this.http.get<Specialite>(`${this.apiUrl}/api/specialites/${id}`);
  }
}