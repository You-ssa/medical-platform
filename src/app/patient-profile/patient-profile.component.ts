// =====================================================
// PATIENT PROFILE COMPONENT - patient-profile.component.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../services/patient.service';
import { Patient } from '../models/patient.model';
import { PaysService, Pays } from '../services/pays.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit {
  patient: Patient | null = null;
  profileForm!: FormGroup;
  isEditMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  paysList: Pays[] = [];
  villesList: string[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private paysService: PaysService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPays();
    this.loadPatientData();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      nom: [{ value: '', disabled: true }, Validators.required],
      prenom: [{ value: '', disabled: true }, Validators.required],
      sexe: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      pays: [{ value: '', disabled: true }, Validators.required],
      ville: [{ value: '', disabled: true }, Validators.required],
      telephone: [{ value: '', disabled: true }, Validators.required]
    });
  }

  loadPatientData(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const stored = JSON.parse(currentUser);
    const rawId = stored.id ?? stored._id;
    const patientId = (typeof rawId === 'string' && !Number.isNaN(Number(rawId)))
      ? Number(rawId)
      : rawId;

    this.patient = {
      ...stored,
      id: patientId,
      photo_base64: this.normalizePhoto(stored.photo_base64 ?? stored.photoBase64)
    };
    this.patchFormValues();
    this.syncVillesFromPays();

    if (patientId && !Number.isNaN(patientId)) {
      this.patientService.getPatientById(patientId).subscribe({
        next: (patient) => {
          this.patient = {
            ...this.patient,
            ...patient,
            photo_base64: this.normalizePhoto(
              patient.photo_base64 ??
              (this.patient as any)?.photo_base64 ??
              (patient as any)?.photoBase64
            )
          };
          this.patchFormValues();
          this.syncVillesFromPays();
        },
        error: (err) => console.error('Erreur chargement patient', err)
      });
    }
  }

  patchFormValues(): void {
    if (!this.patient) return;
    this.profileForm.patchValue({
      nom: this.patient.nom,
      prenom: this.patient.prenom,
      sexe: this.patient.sexe,
      email: this.patient.email,
      pays: this.patient.pays,
      ville: this.patient.ville,
      telephone: this.patient.telephone
    });
    this.profileForm.disable();
  }

  async loadPays(): Promise<void> {
    try {
      this.paysList = await this.paysService.getPays();
      this.syncVillesFromPays();
    } catch (err) {
      console.error('Erreur chargement pays', err);
    }
  }

  onPaysChange(): void {
    this.syncVillesFromPays();
  }

  private syncVillesFromPays(): void {
    const selectedPays = this.profileForm?.get('pays')?.value || this.patient?.pays;
    if (!selectedPays) {
      this.villesList = [];
      return;
    }
    const pays = this.paysList.find(p => p.nom === selectedPays);
    this.villesList = pays?.villes ?? [];
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
      this.patchFormValues();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.patient?.id) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = e.target.result;

      this.patientService.uploadProfilePhoto(this.patient!.id!, base64String).subscribe({
        next: () => {
          this.successMessage = 'Photo de profil mise à jour avec succès';
          if (this.patient) {
            this.patient.photo_base64 = this.normalizePhoto(base64String);
            localStorage.setItem('currentUser', JSON.stringify(this.patient));
          }
          this.selectedFile = null;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la mise à jour de la photo';
          console.error(err);
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.patient?.id) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.profileForm.getRawValue();

    this.patientService.updatePatientProfile(this.patient.id, formData).subscribe({
      next: (updatedPatient) => {
        this.patient = {
          ...this.patient,
          ...updatedPatient,
          photo_base64: this.normalizePhoto(
            updatedPatient.photo_base64 ?? this.patient?.photo_base64
          )
        };
        localStorage.setItem('currentUser', JSON.stringify(this.patient));
        this.successMessage = 'Profil mis à jour avec succès';
        this.loading = false;
        this.isEditMode = false;
        this.profileForm.disable();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du profil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.patchFormValues();
    this.selectedFile = null;
    this.previewUrl = null;
  }

  getDefaultAvatar(): string {
    if (!this.patient?.prenom || !this.patient?.nom) return '';
    const initials = `${this.patient.prenom[0] ?? ''}${this.patient.nom[0] ?? ''}`.toUpperCase();
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#2563EB" width="200" height="200"/>
        <text fill="#fff" font-family="sans-serif" font-size="80" x="50%" y="50%" 
              dominant-baseline="middle" text-anchor="middle">${initials}</text>
      </svg>
    `)}`;
  }

  private normalizePhoto(photo?: string): string | undefined {
    if (!photo) return undefined;
    return photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`;
  }

  getPhotoSrc(): string | undefined {
    if (this.previewUrl) return this.previewUrl;
    if (this.patient?.photo_base64) return this.patient.photo_base64;
    return undefined;
  }
}
