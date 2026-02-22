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
  }

  private buildUrls(path: string): string[] {
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return this.apiBases.map(base => `${base}${suffix}`);
  }

  private async fetchFirstAvailable<T>(path: string, fallback: T): Promise<T> {
    const result = await firstValueFrom(
      from(this.buildUrls(path)).pipe(
        concatMap(url => this.http.get<T>(url).pipe(catchError(() => EMPTY))),
        take(1),
        defaultIfEmpty(null as any)
      )
    );

    return result ?? fallback;
  }

  async getStatistics(): Promise<Statistics> {
    return this.fetchFirstAvailable<Statistics>('/stats', this.defaultStatistics());
  }

  async getMedecinsList(): Promise<User[]> {
    const data = await this.fetchFirstAvailable<any[]>('/medecins-approuves', []);
    return (data || []).map(item => this.normalizeMedecin(item));
  }

  async getPatientsList(): Promise<User[]> {
    const data = await this.fetchFirstAvailable<any[]>('/patients', []);
    return (data || []).map(item => this.normalizePatient(item));
  }

  async getSecretairesList(): Promise<User[]> {
    const data = await this.fetchFirstAvailable<any[]>('/secretaires-approuves', []);
    return (data || []).map(item => this.normalizeSecretaire(item));
  }

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

  private normalizeMedecin(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idMedecin ?? data?.medecinId ?? undefined,
      nom: data?.nom ?? data?.name ?? '',
      prenom: data?.prenom ?? data?.firstName ?? '',
      email: data?.email ?? '',
      telephone: data?.telephone ?? data?.phone ?? '',
      motDePasse: '',
      userType: 'medecin',
      dateInscription: data?.dateInscription ?? data?.createdAt ?? '',
      photoBase64: data?.photoBase64 ?? data?.photo ?? data?.image ?? undefined,
      sexe: data?.sexe ?? data?.gender,
      pays: data?.pays ?? data?.country,
      ville: data?.ville ?? data?.city,
      rpps: data?.rpps ?? data?.numeroRPPS ?? data?.numeroRpps,
      specialite: data?.specialite ?? data?.specialty ?? data?.departement,
      adresseHopital: data?.adresseHopital ?? data?.hopital ?? data?.hospital,
      statut: data?.statut ?? data?.status ?? data?.etat
    };
  }

  private normalizePatient(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idPatient ?? data?.patientId ?? undefined,
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

  private normalizeSecretaire(data: any): User {
    return {
      id: data?.id ?? data?._id ?? data?.idSecretaire ?? data?.secretaireId ?? undefined,
      nom: data?.nom ?? data?.name ?? '',
      prenom: data?.prenom ?? data?.firstName ?? '',
      email: data?.email ?? '',
      telephone: data?.telephone ?? data?.phone ?? '',
      motDePasse: '',
      userType: 'secretaire',
      dateInscription: data?.dateInscription ?? data?.createdAt ?? '',
      photoBase64: data?.photoBase64 ?? data?.photo ?? data?.image ?? undefined,
      sexe: data?.sexe ?? data?.gender,
      pays: data?.pays ?? data?.country,
      ville: data?.ville ?? data?.city,
      statut: data?.statut ?? data?.status ?? data?.etat,
      poste: data?.poste ?? data?.role ?? 'Secrétaire',
      departement: data?.departement ?? data?.department
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
