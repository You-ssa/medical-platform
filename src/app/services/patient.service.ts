import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, of, throwError } from 'rxjs';
import { catchError, concatMap, defaultIfEmpty, first } from 'rxjs/operators';
import {
  Patient,
  DossierMedical,
  ContactUrgence,
  RendezVous,
  PatientNotification,
  DashboardStats
} from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiBaseCandidates = [
    `${environment.apiUrl}/api/patients`,
    `${environment.apiUrl}/patients`
  ];

  constructor(private http: HttpClient) {}

  // ================= Helpers =================
  private tryUrls<T>(paths: string[], method: 'get' | 'put', body?: any): Observable<T> {
    return of(...paths).pipe(
      concatMap(url => {
        const req = method === 'get' ? this.http.get<T>(url) : this.http.put<T>(url, body);
        return req.pipe(
          catchError(err => {
            if (err.status === 404 || err.status === 0) {
              return EMPTY; // essayer l'URL suivante
            }
            return throwError(() => err);
          })
        );
      }),
      first(),
      defaultIfEmpty(body as T)
    );
  }

  private buildPaths(suffix: string): string[] {
    return this.apiBaseCandidates.map(base => `${base}${suffix}`);
  }

  // ================= Dashboard =================
  getDashboardStats(patientId: number | string): Observable<DashboardStats> {
    const paths = this.buildPaths(`/${patientId}/stats`);
    return this.tryUrls<DashboardStats>(paths, 'get').pipe(
      catchError(() => of({
        prochains_rdv: 0,
        consultations_totales: 0,
        documents_medicaux: 0,
        notifications_non_lues: 0
      }))
    );
  }

  getRendezVous(patientId: number | string): Observable<RendezVous[]> {
    const paths = this.buildPaths(`/${patientId}/rendez-vous`);
    return this.tryUrls<RendezVous[]>(paths, 'get').pipe(
      catchError(() => of([]))
    );
  }

  getNotifications(patientId: number | string): Observable<PatientNotification[]> {
    const paths = this.buildPaths(`/${patientId}/notifications`);
    return this.tryUrls<PatientNotification[]>(paths, 'get').pipe(
      catchError(() => of([]))
    );
  }

  markNotificationAsRead(notificationId: number): Observable<any> {
    const paths = this.buildPaths(`/notifications/${notificationId}/read`);
    return this.tryUrls(paths, 'put', {});
  }

  // ================= Dossier Médical =================
  getDossierMedical(patientId: number | string): Observable<DossierMedical> {
    const paths = this.buildPaths(`/${patientId}/dossier-medical`);
    return this.tryUrls<DossierMedical>(paths, 'get');
  }

  createDossierMedical(dossier: any): Observable<DossierMedical> {
    const paths = this.buildPaths(`/${dossier.patient_id}/dossier-medical`);
    return this.tryUrls<DossierMedical>(paths, 'put', dossier);
  }

  updateDossierMedical(patientId: number | string, dossier: any): Observable<DossierMedical> {
    const paths = this.buildPaths(`/${patientId}/dossier-medical`);
    return this.tryUrls<DossierMedical>(paths, 'put', dossier);
  }

  // ================= Contacts d'urgence =================
  getContactsUrgence(patientId: number | string): Observable<ContactUrgence[]> {
    const paths = this.buildPaths(`/${patientId}/contacts-urgence`);
    return this.tryUrls<ContactUrgence[]>(paths, 'get');
  }

  createContactUrgence(contact: ContactUrgence): Observable<ContactUrgence> {
    const paths = this.buildPaths(`/${contact.patient_id}/contacts-urgence`);
    return this.tryUrls<ContactUrgence>(paths, 'put', contact);
  }

  updateContactUrgence(contactId: number, contact: ContactUrgence): Observable<ContactUrgence> {
    const paths = this.buildPaths(`/contacts-urgence/${contactId}`);
    return this.tryUrls<ContactUrgence>(paths, 'put', contact);
  }

  deleteContactUrgence(contactId: number): Observable<any> {
    const paths = this.buildPaths(`/contacts-urgence/${contactId}`);
    return this.tryUrls(paths, 'put', {});
  }

  // ================= Profil patient =================
  getPatientById(id: number | string): Observable<Patient> {
    const paths = this.buildPaths(`/${id}`);
    return this.tryUrls<Patient>(paths, 'get');
  }

  updatePatientProfile(patientId: number | string, patient: Patient): Observable<Patient> {
    const body: any = { ...patient };
    if (!body.date_inscription) body.date_inscription = new Date().toISOString();
    const paths = this.buildPaths(`/${patientId}`);
    return this.tryUrls<Patient>(paths, 'put', body);
  }

  uploadProfilePhoto(patientId: number | string, photoBase64: string): Observable<any> {
    const paths = this.buildPaths(`/${patientId}/photo`);
    return this.tryUrls(paths, 'put', { photo_base64: photoBase64 });
  }
}
