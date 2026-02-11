export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  sexe: string;
  email: string;
  pays: string;
  ville: string;
  telephone: string;
  photo_base64?: string;
  date_inscription?: string | Date; // Ajouté ici
}

export interface DossierMedical {
  id?: number;
  patient_id: number;
  date_naissance: string;
  groupe_sanguin: string;
  maladies_chroniques: string[];
  maladies_hereditaires: string[];
  allergies: string[];
  medicaments_en_cours: string[];
  observations_medicales: string;
  don_organes: boolean;
  directives_anticipees: string;
}

export interface ContactUrgence {
  id?: number;
  patient_id: number;
  nom: string;
  lien: string;
  telephone: string;
  ordre: number;
}

export interface RendezVous {
  id?: number;
  patient_id: number;
  medecin_id: number;
  date_rdv: Date | string;
  statut: string;
  motif: string;
  notes?: string;
  medecin?: {
    nom: string;
    specialite: string;
  };
}

export interface PatientNotification {
  id?: number;
  patient_id: number;
  type_notification: string;
  titre: string;
  message: string;
  lue: boolean;
  created_at?: Date | string;
}

export interface DashboardStats {
  prochains_rdv: number;
  consultations_totales: number;
  documents_medicaux: number;
  notifications_non_lues: number;
}