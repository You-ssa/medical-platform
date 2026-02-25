import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, firstValueFrom, from, throwError } from 'rxjs';
import { catchError, concatMap, defaultIfEmpty, map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from './user.service';

export interface Statistics {
  totalPatients: number;
  totalMedecins: number;
  totalSecretaires: number;
  demandesEnAttente: number;
  consultationsMensuelles: number;
  tauxUtilisation: number;
  nouvellesNotifications: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly apiBases: string[];

  constructor(private http: HttpClient) {
    const base = environment.apiUrl ?? 'http://localhost:3000';
    this.apiBases = [`${base}/api`, base].filter((url, index, self) => url && self.indexOf(url) === index);
    console.log('🔧 StatsService initialisé avec bases:', this.apiBases);
  }

  private buildUrls(path: string): string[] {
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return this.apiBases.map(base => `${base}${suffix}`);
  }

  private async fetchFirstAvailable<T>(path: string, fallback: T): Promise<T> {
    console.log(`📡 Tentative de fetch pour: ${path}`);
    
    const result = await firstValueFrom(
      from(this.buildUrls(path)).pipe(
        concatMap(url => {
          console.log(`📡 Appel à: ${url}`);
          return this.http.get<T>(url).pipe(
            catchError(err => {
              console.log(`❌ Échec ${url}: ${err.status}`);
              return EMPTY;
            })
          );
        }),
        take(1),
        defaultIfEmpty(null as any)
      )
    );

    console.log(`📦 Résultat pour ${path}:`, result ? '✅ Données trouvées' : '❌ Aucune donnée');
    return result ?? fallback;
  }

  async getStatistics(): Promise<Statistics> {
    return this.fetchFirstAvailable<Statistics>('/stats', this.defaultStatistics());
  }

  // ── MÉDECINS ────────────────────────────────────────────────
  async getMedecinsList(): Promise<User[]> {
    try {
      console.log('🔍 Récupération des médecins approuvés...');
      const data = await this.fetchFirstAvailable<any[]>('/medecins-approuves', []);
      
      console.log(`📊 Nombre de médecins reçus: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        console.log('✅ Premier médecin:', data[0]);
        return (data || []).map(item => this.normalizeMedecin(item));
      }
      
      console.log('⚠️ Aucune donnée, tentative avec route générique...');
      const backupData = await this.fetchFirstAvailable<any[]>('/medecins?statut=approuve', []);
      
      if (backupData && backupData.length > 0) {
        console.log('✅ Données de secours trouvées:', backupData.length);
        return (backupData || []).map(item => this.normalizeMedecin(item));
      }
      
      console.log('❌ Aucun médecin trouvé');
      return [];
      
    } catch (error) {
      console.error('❌ Erreur chargement médecins:', error);
      return [];
    }
  }

  async getMedecinsEnAttente(): Promise<User[]> {
    try {
      console.log('🔍 Récupération des médecins en attente...');
      const data = await this.fetchFirstAvailable<any[]>('/medecins-en-attente', []);
      
      console.log(`📊 Nombre de médecins en attente reçus: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        return (data || []).map(item => this.normalizeMedecin(item));
      }
      
      const backupData = await this.fetchFirstAvailable<any[]>('/medecins?statut=en_attente', []);
      return (backupData || []).map(item => this.normalizeMedecin(item));
      
    } catch (error) {
      console.error('❌ Erreur chargement médecins en attente:', error);
      return [];
    }
  }

  // ── SECRÉTAIRES ─────────────────────────────────────────────
  async getSecretairesList(): Promise<User[]> {
    try {
      console.log('🔍 Récupération des secrétaires approuvées...');
      const data = await this.fetchFirstAvailable<any[]>('/secretaires-approuves', []);
      
      console.log(`📊 Nombre de secrétaires reçues: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        console.log('✅ Première secrétaire:', data[0]);
        return (data || []).map(item => this.normalizeSecretaire(item));
      }
      
      console.log('⚠️ Aucune donnée, tentative avec route générique...');
      const backupData = await this.fetchFirstAvailable<any[]>('/secretaires?statut=approuve', []);
      
      if (backupData && backupData.length > 0) {
        console.log('✅ Données de secours trouvées:', backupData.length);
        return (backupData || []).map(item => this.normalizeSecretaire(item));
      }
      
      console.log('❌ Aucune secrétaire trouvée');
      return [];
      
    } catch (error) {
      console.error('❌ Erreur chargement secrétaires:', error);
      return [];
    }
  }

  async getSecretairesEnAttente(): Promise<User[]> {
    try {
      console.log('🔍 Récupération des secrétaires en attente...');
      const data = await this.fetchFirstAvailable<any[]>('/secretaires-en-attente', []);
      
      console.log(`📊 Nombre de secrétaires en attente reçues: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        return (data || []).map(item => this.normalizeSecretaire(item));
      }
      
      const backupData = await this.fetchFirstAvailable<any[]>('/secretaires?statut=en_attente', []);
      return (backupData || []).map(item => this.normalizeSecretaire(item));
      
    } catch (error) {
      console.error('❌ Erreur chargement secrétaires en attente:', error);
      return [];
    }
  }

  // ── PATIENTS ─────────────────────────────────────────────────
  async getPatientsList(): Promise<User[]> {
    const data = await this.fetchFirstAvailable<any[]>('/patients', []);
    return (data || []).map(item => this.normalizePatient(item));
  }

  // ── STATISTIQUES PAR DÉFAUT ─────────────────────────────────
  private defaultStatistics(): Statistics {
    return {
      totalPatients: 0,
      totalMedecins: 0,
      totalSecretaires: 0,
      demandesEnAttente: 0,
      consultationsMensuelles: 0,
      tauxUtilisation: 0,
      nouvellesNotifications: 0
    };
  }

  // ── NORMALISATION DES DONNÉES ───────────────────────────────
  private normalizeMedecin(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idMedecin ?? data?.medecinId ? String(data.id) : undefined,
      nom: data?.nom ?? data?.name ?? '',
      prenom: data?.prenom ?? data?.firstName ?? '',
      email: data?.email ?? '',
      telephone: data?.telephone ?? data?.phone ?? '',
      motDePasse: '',
      userType: 'medecin',
      dateInscription: data?.dateInscription ?? data?.createdAt ?? data?.date_inscription ?? '',
      photoBase64: data?.photoBase64 ?? data?.photo ?? data?.image ?? data?.photo_base64 ?? undefined,
      sexe: data?.sexe ?? data?.gender,
      pays: data?.pays ?? data?.country,
      ville: data?.ville ?? data?.city,
      rpps: data?.rpps ?? data?.numeroRPPS ?? data?.numeroRpps,
      specialite: data?.specialite ?? data?.specialty ?? data?.departement,
      specialite_id: data?.specialite_id ? parseInt(data.specialite_id) : undefined,
      adresseHopital: data?.adresseHopital ?? data?.hopital ?? data?.hospital ?? data?.adresse_hopital,
      statut: data?.statut ?? data?.status ?? data?.etat
    };
  }

  private normalizeSecretaire(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idSecretaire ?? data?.secretaireId ? String(data.id) : undefined,
      nom: data?.nom ?? data?.name ?? '',
      prenom: data?.prenom ?? data?.firstName ?? '',
      email: data?.email ?? '',
      telephone: data?.telephone ?? data?.phone ?? '',
      motDePasse: '',
      userType: 'secretaire',
      dateInscription: data?.dateInscription ?? data?.createdAt ?? data?.date_inscription ?? '',
      photoBase64: data?.photoBase64 ?? data?.photo ?? data?.image ?? data?.photo_base64 ?? undefined,
      sexe: data?.sexe ?? data?.gender,
      pays: data?.pays ?? data?.country,
      ville: data?.ville ?? data?.city,
      specialite: data?.specialite ?? data?.departement,
      specialite_id: data?.specialite_id ? parseInt(data.specialite_id) : undefined,
      adresseHopital: data?.adresseHopital ?? data?.hopital ?? data?.hospital ?? data?.adresse_hopital,
      statut: data?.statut ?? data?.status ?? data?.etat,
      poste: data?.poste ?? data?.role ?? 'Secrétaire',
      departement: data?.departement ?? data?.department
    };
  }

  private normalizePatient(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idPatient ?? data?.patientId ? String(data.id) : undefined,
      nom: data?.nom ?? data?.name ?? '',
      prenom: data?.prenom ?? data?.firstName ?? '',
      email: data?.email ?? '',
      telephone: data?.telephone ?? data?.phone ?? '',
      motDePasse: '',
      userType: 'patient',
      dateInscription: data?.dateInscription ?? data?.createdAt ?? '',
      photoBase64: data?.photoBase64 ?? data?.photo ?? data?.image ?? undefined,
      sexe: data?.sexe ?? data?.gender,
      pays: data?.pays ?? data?.country,
      ville: data?.ville ?? data?.city,
      statut: data?.statut ?? data?.status ?? data?.etat
    };
  }

  private handleError<T>(message: string, silent = false) {
    return (error: HttpErrorResponse) => {
      if (!silent) {
        console.error(message, error);
      }
      return throwError(() => error);
    };
  }
}