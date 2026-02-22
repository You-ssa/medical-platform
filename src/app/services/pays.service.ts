import { Injectable } from '@angular/core';

export interface Pays {
  nom: string;
  drapeau: string;
  indicatif: string;
  formatTel: string;
  villes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PaysService {
  private paysCache: Pays[] = [];

  constructor() {}

  /**
   * Précharge les pays au démarrage (utilisé par l'initialiseur Firebase).
   */
  async initializePays(): Promise<void> {
    await this.getPays();
  }

  /**
   * Retourne la liste des pays (cache mémoire).
   */
  async getPays(): Promise<Pays[]> {
    if (this.paysCache.length > 0) {
      return this.paysCache;
    }
    this.paysCache = this.buildPaysData();
    return this.paysCache;
  }

  private buildPaysData(): Pays[] {
    return [
      {
        nom: 'Tunisie',
        drapeau: '🇹🇳',
        indicatif: '+216',
        formatTel: 'XX XXX XXX',
        villes: [
          'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte',
          'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
          'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
          'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Zaghouan', 'Siliana',
          'Le Kef', 'Tozeur', 'Kébili', 'Manouba'
        ]
      },
      {
        nom: 'France',
        drapeau: '🇫🇷',
        indicatif: '+33',
        formatTel: 'X XX XX XX XX',
        villes: [
          'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
          'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
          'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon',
          'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'
        ]
      },
      {
        nom: 'Maroc',
        drapeau: '🇲🇦',
        indicatif: '+212',
        formatTel: 'XXX-XXXXXX',
        villes: [
          'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir',
          'Tanger', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
          'Safi', 'Temara', 'Mohammédia', 'El Jadida', 'Béni Mellal'
        ]
      },
      {
        nom: 'Algérie',
        drapeau: '🇩🇿',
        indicatif: '+213',
        formatTel: 'XXX XX XX XX',
        villes: [
          'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida',
          'Batna', 'Sétif', 'Djelfa', 'Sidi Bel Abbès', 'Biskra',
          'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa'
        ]
      },
      {
        nom: 'Belgique',
        drapeau: '🇧🇪',
        indicatif: '+32',
        formatTel: 'XXX XX XX XX',
        villes: [
          'Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège',
          'Bruges', 'Namur', 'Louvain', 'Mons', 'Malines'
        ]
      },
      {
        nom: 'Suisse',
        drapeau: '🇨🇭',
        indicatif: '+41',
        formatTel: 'XX XXX XX XX',
        villes: [
          'Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne',
          'Winterthour', 'Lucerne', 'Saint-Gall', 'Lugano', 'Bienne'
        ]
      },
      {
        nom: 'Canada',
        drapeau: '🇨🇦',
        indicatif: '+1',
        formatTel: '(XXX) XXX-XXXX',
        villes: [
          'Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton',
          'Ottawa', 'Winnipeg', 'Québec', 'Hamilton', 'Kitchener'
        ]
      }
    ];
  }
}
