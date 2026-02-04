import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

export interface User {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  userType: 'patient' | 'medecin' | 'secretaire' | 'admin';
  dateInscription: string;
  photoBase64?: string; // Stockage direct en binaire (Base64)
  
  // Champs spécifiques patient
  sexe?: string;
  pays?: string;
  ville?: string;
  
  // Champs spécifiques médecin
  specialite?: string;
  rpps?: string;
  adresseHopital?: string;
  statut?: 'en_attente' | 'approuve' | 'refuse';
  
  // Champs spécifiques secrétaire
  poste?: string;
  departement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) {}

  /**
   * Convertir un fichier en Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Créer un patient (avec photo optionnelle en Base64)
   */
  async createPatient(user: User, photoFile?: File): Promise<void> {
    try {
      if (photoFile) {
        user.photoBase64 = await this.fileToBase64(photoFile);
      }

      user.userType = 'patient';
      user.dateInscription = new Date().toISOString();
      await addDoc(collection(this.firestore, 'patients'), user);
      console.log('✅ Patient créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création patient:', error);
      throw error;
    }
  }

  /**
   * Créer un médecin
   */
  async createMedecin(user: User, photoFile?: File): Promise<void> {
    try {
      if (photoFile) {
        user.photoBase64 = await this.fileToBase64(photoFile);
      }

      user.userType = 'medecin';
      user.statut = 'en_attente';
      user.dateInscription = new Date().toISOString();
      
      const docRef = await addDoc(collection(this.firestore, 'medecins'), user);
      console.log('✅ Médecin créé - En attente d\'approbation - ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erreur création médecin:', error);
      throw error;
    }
  }

  /**
   * Créer un secrétaire
   */
  async createSecretaire(user: User, photoFile?: File): Promise<void> {
    try {
      if (photoFile) {
        user.photoBase64 = await this.fileToBase64(photoFile);
      }

      user.userType = 'secretaire';
      user.statut = 'en_attente';
      user.dateInscription = new Date().toISOString();
      
      const docRef = await addDoc(collection(this.firestore, 'secretaires'), user);
      console.log('✅ Secrétaire créé - En attente d\'approbation - ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erreur création secrétaire:', error);
      throw error;
    }
  }

  /**
   * Créer un admin
   */
  async createAdmin(user: User): Promise<void> {
    try {
      user.userType = 'admin';
      user.dateInscription = new Date().toISOString();
      await addDoc(collection(this.firestore, 'admins'), user);
      console.log('✅ Admin créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création admin:', error);
      throw error;
    }
  }

  // ... (le reste de UserService reste inchangé)


  /**
   * Connexion utilisateur
   */
  async login(email: string, motDePasse: string, userType: string): Promise<User | null> {
    try {
      const collectionName = this.getCollectionName(userType);
      if (!collectionName) {
        console.log('❌ Type d\'utilisateur invalide');
        return null;
      }

      const q = query(
        collection(this.firestore, collectionName),
        where('email', '==', email)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('❌ Aucun utilisateur trouvé avec cet email');
        return null;
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data() as User;
      user.id = userDoc.id;

      // Vérifier le mot de passe
      if (user.motDePasse !== motDePasse) {
        console.log('❌ Mot de passe incorrect');
        return null;
      }

      // Vérifier si médecin/secrétaire est approuvé
      if ((userType === 'medecin' || userType === 'secretaire') && user.statut !== 'approuve') {
        console.log('❌ Compte en attente d\'approbation ou refusé');
        throw new Error('Votre compte est en attente de validation par un administrateur');
      }

      console.log('✅ Connexion réussie:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un email existe déjà
   */
  async emailExists(email: string, userType: string): Promise<boolean> {
    try {
      const collectionName = this.getCollectionName(userType);
      if (!collectionName) {
        return false;
      }

      const q = query(
        collection(this.firestore, collectionName),
        where('email', '==', email)
      );
      
      const snapshot = await getDocs(q);
      const exists = !snapshot.empty;
      
      if (exists) {
        console.log('⚠️ Email déjà utilisé:', email);
      }
      
      return exists;
    } catch (error) {
      console.error('❌ Erreur vérification email:', error);
      return false;
    }
  }

  /**
   * Approuver un médecin ou secrétaire
   */
  async approuverUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    try {
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }

      const collectionName = userType === 'medecin' ? 'medecins' : 'secretaires';
      const docRef = doc(this.firestore, collectionName, userId);
      
      await updateDoc(docRef, { 
        statut: 'approuve',
        dateApprobation: new Date().toISOString()
      });
      
      console.log(`✅ ${userType} approuvé avec succès - ID: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      throw error;
    }
  }

  /**
   * Refuser un médecin ou secrétaire
   */
  async refuserUtilisateur(userId: string, userType: 'medecin' | 'secretaire'): Promise<void> {
    try {
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }

      const collectionName = userType === 'medecin' ? 'medecins' : 'secretaires';
      const docRef = doc(this.firestore, collectionName, userId);
      
      // Option 1: Supprimer complètement l'utilisateur
      await deleteDoc(docRef);
      console.log(`✅ ${userType} refusé et supprimé - ID: ${userId}`);
      
      // Option 2: Marquer comme refusé (décommentez si vous préférez garder l'historique)
      // await updateDoc(docRef, { 
      //   statut: 'refuse',
      //   dateRefus: new Date().toISOString()
      // });
      // console.log(`✅ ${userType} refusé - ID: ${userId}`);
      
    } catch (error) {
      console.error('❌ Erreur refus:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs en attente
   */
  /**
 * Récupérer les médecins ou secrétaires en attente
 */
async getUtilisateursEnAttente(
  userType: 'medecin' | 'secretaire'
): Promise<User[]> {
  try {
    const collectionName =
      userType === 'medecin' ? 'medecins' : 'secretaires';

    const q = query(
      collection(this.firestore, collectionName),
      where('statut', '==', 'en_attente')
    );

    const snapshot = await getDocs(q);

    const users: User[] = [];

    snapshot.forEach(docSnap => {
      const user = docSnap.data() as User;
      user.id = docSnap.id;
      users.push(user);
    });

    return users;
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs en attente:', error);
    return [];
  }
}

  /**
   * Obtenir le nom de la collection selon le type d'utilisateur
   */
  private getCollectionName(userType: string): string {
    switch (userType) {
      case 'patient':
        return 'patients';
      case 'medecin':
        return 'medecins';
      case 'secretaire':
        return 'secretaires';
      case 'admin':
        return 'admins';
      default:
        console.error('❌ Type d\'utilisateur invalide:', userType);
        return '';
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(userId: string, userType: string): Promise<User | null> {
    try {
      const collectionName = this.getCollectionName(userType);
      if (!collectionName) {
        return null;
      }

      const docRef = doc(this.firestore, collectionName, userId);
      const docSnap = await getDocs(query(collection(this.firestore, collectionName), where('__name__', '==', userId)));
      
      if (!docSnap.empty) {
        const user = docSnap.docs[0].data() as User;
        user.id = docSnap.docs[0].id;
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupérer tous les médecins approuvés
   */
  async getMedecinsApprouves(): Promise<User[]> {
    try {
      const q = query(
        collection(this.firestore, 'medecins'),
        where('statut', '==', 'approuve')
      );
      
      const snapshot = await getDocs(q);
      const medecins: User[] = [];
      
      snapshot.forEach(doc => {
        const user = doc.data() as User;
        user.id = doc.id;
        medecins.push(user);
      });
      
      return medecins;
    } catch (error) {
      console.error('❌ Erreur récupération médecins approuvés:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les secrétaires approuvés
   */
  async getSecretairesApprouves(): Promise<User[]> {
    try {
      const q = query(
        collection(this.firestore, 'secretaires'),
        where('statut', '==', 'approuve')
      );
      
      const snapshot = await getDocs(q);
      const secretaires: User[] = [];
      
      snapshot.forEach(doc => {
        const user = doc.data() as User;
        user.id = doc.id;
        secretaires.push(user);
      });
      
      return secretaires;
    } catch (error) {
      console.error('❌ Erreur récupération secrétaires approuvés:', error);
      return [];
    }
  }
}