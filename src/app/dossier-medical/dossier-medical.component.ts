// =====================================================
// DOSSIER MEDICAL COMPONENT - dossier-medical.component.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../services/patient.service';
import { DossierMedical, ContactUrgence, Patient } from '../models/patient.model';
@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dossier-medical.component.html',
  styleUrls: ['./dossier-medical.component.css']
})
export class DossierMedicalComponent implements OnInit {
  patient: Patient | null = null;
  dossierForm!: FormGroup;
  contactsForm!: FormGroup;
  
  dossierExists = false;
  isEditMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  activeTab = 'infos';

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  allergiesCommunes = ['Pénicilline', 'Aspirine', 'Iode', 'Latex', 'Arachides', 'Gluten'];
  maladiesCommunesChroniques = ['Diabète type 1', 'Diabète type 2', 'Hypertension', 'Asthme', 'Arthrite'];
  maladiesCommunesHereditaires = ['Diabète', 'Hypertension', 'Cancer', 'Maladie cardiaque', 'Alzheimer'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.initializeForms();
    this.loadDossierMedical();
  }

  loadPatientData(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.patient = JSON.parse(currentUser);
    }
  }

  initializeForms(): void {
    this.dossierForm = this.fb.group({
      date_naissance: ['', Validators.required],
      groupe_sanguin: ['', Validators.required],
      maladies_chroniques: [[]],
      maladies_hereditaires: [[]],
      allergies: [[]],
      medicaments_en_cours: [[]],
      observations_medicales: [''],
      don_organes: [false],
      directives_anticipees: ['']
    });

    this.contactsForm = this.fb.group({
      contacts: this.fb.array([])
    });

    this.dossierForm.disable();
  }

  get contacts(): FormArray {
    return this.contactsForm.get('contacts') as FormArray;
  }

  createContactFormGroup(contact?: ContactUrgence): FormGroup {
    return this.fb.group({
      id: [contact?.id || null],
      nom: [contact?.nom || '', Validators.required],
      lien: [contact?.lien || '', Validators.required],
      telephone: [contact?.telephone || '', Validators.required],
      ordre: [contact?.ordre || 1]
    });
  }

  addContact(): void {
    this.contacts.push(this.createContactFormGroup());
  }

  removeContact(index: number): void {
    const contactId = this.contacts.at(index).get('id')?.value;
    if (contactId) {
      this.patientService.deleteContactUrgence(contactId).subscribe({
        next: () => {
          this.contacts.removeAt(index);
          this.successMessage = 'Contact supprimé';
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (err) => console.error('Erreur suppression contact:', err)
      });
    } else {
      this.contacts.removeAt(index);
    }
  }

  loadDossierMedical(): void {
    if (!this.patient?.id) return;

    this.loading = true;

    this.patientService.getDossierMedical(this.patient.id).subscribe({
      next: (dossier) => {
        this.dossierExists = true;
        this.patchDossierValues(dossier);
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.dossierExists = false;
          this.isEditMode = true;
          this.dossierForm.enable();
        }
        this.loading = false;
      }
    });

    this.loadContactsUrgence();
  }

  patchDossierValues(dossier: DossierMedical): void {
    this.dossierForm.patchValue({
      date_naissance: dossier.date_naissance,
      groupe_sanguin: dossier.groupe_sanguin,
      maladies_chroniques: dossier.maladies_chroniques || [],
      maladies_hereditaires: dossier.maladies_hereditaires || [],
      allergies: dossier.allergies || [],
      medicaments_en_cours: dossier.medicaments_en_cours || [],
      observations_medicales: dossier.observations_medicales,
      don_organes: dossier.don_organes,
      directives_anticipees: dossier.directives_anticipees
    });
  }

  loadContactsUrgence(): void {
    if (!this.patient?.id) return;

    this.patientService.getContactsUrgence(this.patient.id).subscribe({
      next: (contacts) => {
        this.contacts.clear();
        contacts.forEach(contact => {
          this.contacts.push(this.createContactFormGroup(contact));
        });
        if (this.contacts.length === 0) {
          this.addContact();
          this.addContact();
        }
      },
      error: (err) => {
        console.error('Erreur chargement contacts:', err);
        this.addContact();
        this.addContact();
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.dossierForm.enable();
    } else {
      this.dossierForm.disable();
    }
  }

  onSubmitDossier(): void {
    if (this.dossierForm.invalid || !this.patient?.id) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = {
      ...this.dossierForm.value,
      patient_id: this.patient.id
    };

    const request = this.dossierExists 
      ? this.patientService.updateDossierMedical(this.patient.id, formData)
      : this.patientService.createDossierMedical(formData);

    request.subscribe({
      next: () => {
        this.successMessage = 'Dossier médical enregistré avec succès';
        this.dossierExists = true;
        this.loading = false;
        this.isEditMode = false;
        this.dossierForm.disable();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'enregistrement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitContacts(): void {
    if (this.contactsForm.invalid || !this.patient?.id) return;

    const contacts = this.contacts.value;
    const requests = contacts.map((contact: ContactUrgence, index: number) => {
      contact.patient_id = this.patient!.id!;
      contact.ordre = index + 1;
      
      return contact.id 
        ? this.patientService.updateContactUrgence(contact.id, contact)
        : this.patientService.createContactUrgence(contact);
    });

Promise.all(requests.map((req: any) => req.toPromise()))
      .then(() => {
        this.successMessage = 'Contacts d\'urgence enregistrés';
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch(err => {
        this.errorMessage = 'Erreur lors de l\'enregistrement des contacts';
        console.error(err);
      });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleArrayItem(array: any[], item: any): void {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(item);
    }
  }

  isItemSelected(array: any[], item: any): boolean {
    return array?.includes(item) || false;
  }
}