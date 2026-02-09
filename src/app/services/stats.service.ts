import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

export interface Statistics {
  totalPatients: number;
  totalMedecins: number;
  totalSecretaires: number;
  demandesEnAttente: number;
  consultationsMensuelles: number;
  tauxUtilisation: number;
  nouvellesNotifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private firestore: Firestore) {}

  async getStatistics(): Promise<Statistics> {
    try {
      const [patients, medecins, secretaires, demandesMedecins, demandesSecretaires] = await Promise.all([
        getDocs(collection(this.firestore, 'patients')),
        getDocs(query(collection(this.firestore, 'medecins'), where('statut', '==', 'approuve'))),
        getDocs(query(collection(this.firestore, 'secretaires'), where('statut', '==', 'approuve'))),
        getDocs(query(collection(this.firestore, 'medecins'), where('statut', '==', 'en_attente'))),
        getDocs(query(collection(this.firestore, 'secretaires'), where('statut', '==', 'en_attente')))
      ]);

      return {
        totalPatients: patients.size,
        totalMedecins: medecins.size,
        totalSecretaires: secretaires.size,
        demandesEnAttente: demandesMedecins.size + demandesSecretaires.size,
        consultationsMensuelles: 3540, // À implémenter selon vos besoins
        tauxUtilisation: 68, // À calculer selon vos critères
        nouvellesNotifications: demandesMedecins.size + demandesSecretaires.size
      };
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
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
  }

  async getMedecinsList(): Promise<any[]> {
    try {
      const snapshot = await getDocs(
        query(collection(this.firestore, 'medecins'), where('statut', '==', 'approuve'))
      );
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération médecins:', error);
      return [];
    }
  }

  async getPatientsList(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'patients'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération patients:', error);
      return [];
    }
  }
}