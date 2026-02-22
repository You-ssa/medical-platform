import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  userType: 'patient' | 'medecin' | 'secretaire' | 'admin';
  role?: string;
  dateInscription: string;
  photoBase64?: string;
  sexe?: string;
  pays?: string;
  ville?: string;
  rpps?: string;
  specialite?: string;
  adresseHopital?: string;
  statut?: 'en_attente' | 'approuve' | 'refuse';
  poste?: string;
  departement?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async createPatient(user: User, photoFile?: File): Promise<User> {
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/patient`, this.buildFormData(user, photoFile))
        .pipe(catchError(this.handleError('Erreur création patient')))
    );
  }

  async createMedecin(user: User, photoFile?: File): Promise<User> {
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/medecin`, this.buildFormData(user, photoFile))
        .pipe(catchError(this.handleError('Erreur création médecin')))
    );
  }

  async createSecretaire(user: User, photoFile?: File): Promise<User> {
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/secretaire`, this.buildFormData(user, photoFile))
        .pipe(catchError(this.handleError('Erreur création secrétaire')))
    );
  }

  // ── Inscription admin ────────────────────────────────────────
  // Payload explicite pour garantir que role est toujours envoyé
  async createAdmin(user: User): Promise<User> {
    const payload = {
      nom:        user.nom,
      prenom:     user.prenom,
      email:      user.email,
      motDePasse: user.motDePasse,
      telephone:  user.telephone || '',
      role:       user.role ?? 'sous-admin'  // ✅ jamais undefined
    };
    console.log('📤 createAdmin payload:', payload);
    return firstValueFrom(
      this.http
        .post<User>(
          `${this.apiUrl}/api/register/admin`,
          payload,
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        )
        .pipe(catchError(this.handleError('Erreur création admin')))
    );
  }

  async emailExists(email: string, userType: string): Promise<boolean> {
    const encodedEmail = encodeURIComponent(email);
    return firstValueFrom(
      this.http
        .get<{ exists: boolean }>(`${this.apiUrl}/api/email-exists/${userType}/${encodedEmail}`)
        .pipe(
          map(res => !!res?.exists),
          catchError(() => [false])
        )
    );
  }

  // ── Connexion — stocke l'admin en localStorage après login réussi
  async login(email: string, motDePasse: string, userType: string): Promise<User | null> {
    return firstValueFrom(
      this.http
        .post<User | { user: User; token?: string }>(
          `${this.apiUrl}/api/login`,
          { email, motDePasse, userType },
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        )
        .pipe(
          map(res => {
            const user = (res as any)?.user ?? (res as User);
            // ✅ Stocker l'admin connecté en localStorage pour la vérification de mot de passe
            if (user && userType === 'admin') {
              localStorage.setItem('currentAdmin', JSON.stringify({
                id:   user.id,
                role: user.role
              }));
            }
            return user;
          }),
          catchError(err => this.handleError('Échec de connexion', true)(err))
        )
    );
  }

  async getUtilisateursEnAttente(userType: 'medecin' | 'secretaire'): Promise<User[]> {
    return firstValueFrom(
      this.http
        .get<User[]>(`${this.apiUrl}/api/utilisateurs-en-attente/${userType}`)
        .pipe(
          map(data => (data || []).map(u => this.normalizeUser(u, userType))),
          catchError(this.handleError('Erreur chargement en attente'))
        )
    );
  }

  async approuverUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    await firstValueFrom(
      this.http
        .put<void>(`${this.apiUrl}/api/approuver/${userType}/${userId}`, {})
        .pipe(catchError(this.handleError('Erreur approbation')))
    );
  }

  async refuserUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    await firstValueFrom(
      this.http
        .delete<void>(`${this.apiUrl}/api/refuser/${userType}/${userId}`)
        .pipe(catchError(this.handleError('Erreur refus')))
    );
  }

  // ── Vérifie si un admin PRINCIPAL existe (utilisé par init-admin)
  async adminExists(): Promise<boolean> {
    return firstValueFrom(
      this.http
        .get<{ exists: boolean }>(`${this.apiUrl}/api/admin/exists`)
        .pipe(
          map(res => !!res?.exists),
          catchError(() => [false])
        )
    );
  }

  async getSecretairesApprouves(): Promise<User[]> {
    const response = await fetch(`${this.apiUrl}/api/secretaires-approuves`);
    return await response.json();
  }

  private normalizeUser(raw: any, userType: 'medecin' | 'secretaire'): User {
    return {
      ...raw,
      id:              String(raw.id),
      userType,
      adresseHopital:  raw.adresseHopital  ?? raw.adresse_hopital,
      dateInscription: raw.dateInscription ?? raw.date_inscription,
      photoBase64:     raw.photoBase64     ?? raw.photo_base64,
    };
  }

  private buildFormData(user: User, photoFile?: File): FormData {
    const formData = new FormData();
    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (photoFile) formData.append('photo', photoFile);
    return formData;
  }

  private handleError(message: string, rethrow = false) {
    return (error: HttpErrorResponse) => {
      console.error(message, error);
      if (rethrow) return throwError(() => error);
      return throwError(() => new Error(message));
    };
  }
}