import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Admin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone?: string;
  dateInscription: string;
}

export interface NewAdmin {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: string;
  telephone?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createAdmin(admin: NewAdmin): Observable<Admin> {
    const payload = {
      nom:        admin.nom,
      prenom:     admin.prenom,
      email:      admin.email,
      motDePasse: admin.motDePasse,
      telephone:  admin.telephone || '',
      role:       admin.role   // ✅ toujours présent car NewAdmin.role est obligatoire
    };
    console.log('📤 AdminService.createAdmin payload:', payload);
    return this.http.post<Admin>(`${this.apiUrl}/register/admin`, payload);
  }

  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admins`);
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admins/${id}`);
  }
}