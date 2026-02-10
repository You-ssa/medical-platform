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
  dateInscription: string;
  photoBase64?: string;
  
  // Champs communs à patients, médecins et secrétaires
  sexe?: string;
  
  // Champs spécifiques aux patients
  pays?: string;
  ville?: string;
   
   // Champs pour médecins (pas pour secrétaires)
  rpps?: string; // Seulement pour médecins
  // Champs communs à médecins et secrétaires
  specialite?: string;
  adresseHopital?: string;
  statut?: 'en_attente' | 'approuve' | 'refuse';
  
  // Champs spécifiques aux secrétaires
  poste?: string;
  departement?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  // Définir apiUrl dans environment*.ts (ex: http://localhost:3000)
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Créer un patient
   */
  async createPatient(user: User, photoFile?: File): Promise<User> {
    const formData = this.buildFormData(user, photoFile);
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/patient`, formData)
        .pipe(catchError(this.handleError('Erreur création patient')))
    );
  }

  /**
   * Créer un médecin
   */
  async createMedecin(user: User, photoFile?: File): Promise<User> {
    const formData = this.buildFormData(user, photoFile);
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/medecin`, formData)
        .pipe(catchError(this.handleError('Erreur création médecin')))
    );
  }

  /**
   * Créer une secrétaire
   */
  async createSecretaire(user: User, photoFile?: File): Promise<User> {
    const formData = this.buildFormData(user, photoFile);
    return firstValueFrom(
      this.http
        .post<User>(`${this.apiUrl}/api/register/secretaire`, formData)
        .pipe(catchError(this.handleError('Erreur création secrétaire')))
    );
  }

  /**
   * Créer un admin
   */
  async createAdmin(user: User): Promise<User> {
    return firstValueFrom(
      this.http
        .post<User>(
          `${this.apiUrl}/api/register/admin`,
          user,
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        )
        .pipe(catchError(this.handleError('Erreur création admin')))
    );
  }

  /**
   * Vérifier si un email existe
   */
  async emailExists(email: string, userType: string): Promise<boolean> {
    const encodedEmail = encodeURIComponent(email);
    return firstValueFrom(
      this.http
        .get<{ exists: boolean }>(`${this.apiUrl}/api/email-exists/${userType}/${encodedEmail}`)
        .pipe(
          map(res => !!res?.exists),
          catchError(err => {
            console.error('Erreur vérification email', err);
            return [false];
          })
        )
    );
  }

  /**
   * Connexion
   */
  async login(email: string, motDePasse: string, userType: string): Promise<User | null> {
    return firstValueFrom(
      this.http
        .post<User | { user: User; token?: string }>(
          `${this.apiUrl}/api/login`,
          { email, motDePasse, userType },
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        )
        .pipe(
          map(res => (res as any)?.user ?? (res as User)),
          catchError(err => this.handleError('Échec de connexion', true)(err))
        )
    );
  }

  /**
   * Récupérer les utilisateurs en attente (admin)
   */
  async getUtilisateursEnAttente(userType: 'medecin' | 'secretaire'): Promise<User[]> {
    return firstValueFrom(
      this.http
        .get<User[]>(`${this.apiUrl}/api/admin/pending`, { params: { type: userType } })
        .pipe(catchError(this.handleError('Erreur chargement en attente')))
    );
  }

  /**
   * Approuver un utilisateur (admin)
   */
  async approuverUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    await firstValueFrom(
      this.http
        .post<void>(`${this.apiUrl}/api/admin/approve`, { userId, userType })
        .pipe(catchError(this.handleError('Erreur approbation')))
    );
  }

  /**
   * Refuser un utilisateur (admin)
   */
  async refuserUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    await firstValueFrom(
      this.http
        .post<void>(`${this.apiUrl}/api/admin/reject`, { userId, userType })
        .pipe(catchError(this.handleError('Erreur refus')))
    );
  }

  /**
   * Vérifier si un admin existe
   */
  async adminExists(): Promise<boolean> {
    return firstValueFrom(
      this.http
        .get<{ exists: boolean }>(`${this.apiUrl}/api/admin/exists`)
        .pipe(
          map(res => !!res?.exists),
          catchError(err => {
            console.error('Erreur vérification admin', err);
            return [false];
          })
        )
    );
  }

  /**
   * Construire FormData pour l'upload
   */
  private buildFormData(user: User, photoFile?: File): FormData {
    const formData = new FormData();
    
    // Ajouter tous les champs de l'utilisateur
    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Ajouter la photo si présente
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    return formData;
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(message: string, rethrow = false) {
    return (error: HttpErrorResponse) => {
      console.error(message, error);
      if (rethrow) {
        return throwError(() => error);
      }
      return throwError(() => new Error(message));
    };
  }
}