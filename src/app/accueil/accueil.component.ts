import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
// Interface pour les spécialités médicales
interface Specialty {
  id: string;
  name: string;
  icon: string;
  color: string;
  conseils: string[];
}

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  current: number;
   icon: string;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements AfterViewInit, OnDestroy {

  @ViewChild('heroVideo') video!: ElementRef<HTMLVideoElement>;
  
  // ========================================
  // PROPRIÉTÉS POUR LA VIDÉO HERO
  // ========================================
  titles = [
    'Votre Santé Connectée',
    'Santé Sans Frontières',
    'À Votre Écoute'
  ];

  subtitles = [
    'Expertise médicale accessible en quelques clics',
    'Éliminez les barrières géographiques pour votre santé',
    'Soins de qualité accessibles 24h/24 et 7j/7'
  ];
  
  
  currentTitleIndex = 0;
  currentTitle = this.titles[0];
  currentSubtitle = this.subtitles[0];
  titleAnimating = true;
  subtitleAnimating = true;
  buttonAnimating = true;
  
  private titleInterval: any;
 /* =========================
     STATISTIQUES
  ========================= */

  stats: StatItem[] = [
  {
    label: 'Patients satisfaits',
    value: 50000,
    suffix: '+',
    current: 0,
    icon: 'assets/patient.png'
  },
  {
    label: 'Médecins experts',
    value: 120,
    current: 0,
    icon: 'assets/doctor.png'
  },
  {
    label: 'Assistance médicale',
    value: 24,
    suffix: '/7',
    current: 0,
    icon: 'assets/time.png'
  }
];


  private observer!: IntersectionObserver;
  private statsAnimated = false;

  animateStats(): void {
    this.stats.forEach(stat => {
      const increment = Math.ceil(stat.value / 100);
      const interval = setInterval(() => {
        stat.current += increment;
        if (stat.current >= stat.value) {
          stat.current = stat.value;
          clearInterval(interval);
        }
      }, 20);
    });
  }
  // ========================================
  // PROPRIÉTÉS POUR LES CONSEILS MÉDICAUX
  // ========================================
  isModalOpen = false;
  currentSpecialty: Specialty = {
    id: '',
    name: '',
    icon: '',
    color: '',
    conseils: []
  };

  specialties: { [key: string]: Specialty } = {
    'medecine-generale': {
      id: 'medecine-generale',
      name: 'Médecine générale',
      icon: 'assets/mede.png',
      color: 'linear-gradient(135deg, #66BB6A, #81C784)',
      conseils: [
        'Consultez régulièrement votre médecin pour un bilan de santé annuel.',
        'Maintenez une alimentation équilibrée riche en fruits et légumes.',
        'Pratiquez une activité physique régulière (30 minutes par jour).',
        'Dormez suffisamment (7-9 heures par nuit) pour une bonne récupération.',
        'Hydratez-vous correctement en buvant au moins 1,5L d\'eau par jour.',
        'Évitez la consommation excessive d\'alcool et le tabac.',
        'Gérez votre stress par des techniques de relaxation ou méditation.',
        'Tenez à jour vos vaccinations selon le calendrier recommandé.',
        'Surveillez votre poids et maintenez un IMC dans les normes.',
        'N\'hésitez pas à consulter dès l\'apparition de symptômes inhabituels.'
      ]
    },
    'cardiologie': {
      id: 'cardiologie',
      name: 'Cardiologie',
      icon: 'assets/cardio.png',
      color: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      conseils: [
        'Contrôlez régulièrement votre tension artérielle.',
        'Réduisez votre consommation de sel et d\'aliments gras.',
        'Pratiquez une activité physique adaptée à votre condition cardiaque.',
        'Évitez le tabac qui endommage gravement les vaisseaux sanguins.',
        'Gérez votre cholestérol par une alimentation saine.',
        'Surveillez votre poids pour éviter la surcharge cardiaque.',
        'Apprenez à reconnaître les signes d\'une crise cardiaque.',
        'Réduisez le stress qui peut affecter votre cœur.',
        'Limitez la consommation d\'alcool à des quantités modérées.',
        'Prenez vos médicaments cardiaques selon les prescriptions.'
      ]
    },
    'dermatologie': {
      id: 'dermatologie',
      name: 'Dermatologie',
      icon: 'assets/dermato.png',
      color: 'linear-gradient(135deg, #FFCA28, #FFD54F)',
      conseils: [
        'Protégez votre peau du soleil avec un écran solaire SPF 30+.',
        'Hydratez quotidiennement votre peau avec une crème adaptée.',
        'Examinez régulièrement vos grains de beauté pour détecter tout changement.',
        'Évitez les expositions prolongées au soleil entre 12h et 16h.',
        'Nettoyez votre peau matin et soir avec des produits doux.',
        'Buvez suffisamment d\'eau pour maintenir l\'hydratation cutanée.',
        'Adoptez une alimentation riche en antioxydants et vitamines.',
        'Évitez de fumer, le tabac accélère le vieillissement cutané.',
        'Consultez pour toute lésion qui ne guérit pas en 2 semaines.',
        'Utilisez des produits non comédogènes si vous avez une peau à tendance acnéique.'
      ]
    },
    'pediatrie': {
      id: 'pediatrie',
      name: 'Pédiatrie',
      icon: 'assets/pediatre.png',
      color: 'linear-gradient(135deg, #FFA726, #FFB74D)',
      conseils: [
        'Respectez le calendrier vaccinal recommandé pour votre enfant.',
        'Surveillez la croissance et le développement de votre enfant.',
        'Favorisez l\'allaitement maternel dans les 6 premiers mois si possible.',
        'Assurez une alimentation variée et équilibrée adaptée à l\'âge.',
        'Limitez le temps d\'écran selon les recommandations par âge.',
        'Encouragez l\'activité physique et les jeux en plein air.',
        'Maintenez une bonne hygiène dentaire dès les premières dents.',
        'Créez une routine de sommeil régulière adaptée à l\'âge.',
        'Surveillez les signes de déshydratation en cas de maladie.',
        'Consultez rapidement en cas de fièvre élevée ou symptômes inhabituels.'
      ]
    },
    'gynecologie': {
      id: 'gynecologie',
      name: 'Gynécologie / Obstétrique',
      icon: 'assets/gyneco.png',
      color: 'linear-gradient(135deg, #EC407A, #F06292)',
      conseils: [
        'Effectuez un frottis cervical régulier selon les recommandations.',
        'Réalisez une autopalpation mammaire mensuelle.',
        'Consultez votre gynécologue au moins une fois par an.',
        'Prenez de l\'acide folique avant et pendant la grossesse.',
        'Pratiquez une activité physique régulière adaptée.',
        'Adoptez une alimentation saine riche en calcium et fer.',
        'Protégez-vous lors des rapports sexuels pour éviter les IST.',
        'Surveillez votre cycle menstruel et notez les irrégularités.',
        'Consultez en cas de douleurs pelviennes ou saignements anormaux.',
        'Suivez un suivi prénatal régulier en cas de grossesse.'
      ]
    },
    'orthopedie': {
      id: 'orthopedie',
      name: 'Orthopédie',
      icon: 'assets/ortho.png',
      color: 'linear-gradient(135deg, #8D6E63, #A1887F)',
      conseils: [
        'Maintenez une bonne posture au travail et au repos.',
        'Renforcez vos muscles pour protéger vos articulations.',
        'Échauffez-vous avant toute activité sportive.',
        'Évitez le port de charges lourdes de manière inadaptée.',
        'Maintenez un poids santé pour réduire la pression sur les articulations.',
        'Portez des chaussures confortables et adaptées à vos pieds.',
        'Consultez rapidement en cas de douleur articulaire persistante.',
        'Pratiquez des étirements réguliers pour maintenir la souplesse.',
        'Utilisez un matelas et oreiller adaptés pour votre colonne.',
        'Alternez les positions si vous travaillez assis ou debout longtemps.'
      ]
    },
    'neurologie': {
      id: 'neurologie',
      name: 'Neurologie',
      icon: 'assets/neuro.png',
      color: 'linear-gradient(135deg, #7E57C2, #9575CD)',
      conseils: [
        'Stimulez votre cerveau avec des activités intellectuelles régulières.',
        'Dormez suffisamment pour permettre la régénération neuronale.',
        'Pratiquez une activité physique qui améliore la circulation cérébrale.',
        'Adoptez une alimentation méditerranéenne bénéfique pour le cerveau.',
        'Gérez votre stress pour protéger votre système nerveux.',
        'Évitez l\'alcool et les drogues qui endommagent les neurones.',
        'Consultez rapidement en cas de maux de tête inhabituels.',
        'Apprenez à reconnaître les signes d\'un AVC (VITE).',
        'Protégez votre tête lors d\'activités à risque.',
        'Maintenez vos liens sociaux pour prévenir le déclin cognitif.'
      ]
    },
    'orl': {
      id: 'orl',
      name: 'ORL',
      icon: 'assets/orl.png',
      color: 'linear-gradient(135deg, #26C6DA, #4DD0E1)',
      conseils: [
        'Protégez vos oreilles du bruit excessif (concerts, travail bruyant).',
        'Évitez l\'utilisation de coton-tiges qui peuvent endommager le tympan.',
        'Humidifiez l\'air ambiant pour prévenir la sécheresse nasale.',
        'Ne fumez pas, le tabac irrite les voies respiratoires.',
        'Consultez en cas de perte auditive ou acouphènes.',
        'Traitez rapidement les infections ORL pour éviter les complications.',
        'Faites tester votre audition régulièrement après 50 ans.',
        'Évitez de vous exposer aux allergènes si vous êtes sensible.',
        'Hydratez-vous bien pour maintenir les muqueuses humides.',
        'Consultez pour des ronflements importants ou apnées du sommeil.'
      ]
    },
    'ophtalmologie': {
      id: 'ophtalmologie',
      name: 'Ophtalmologie',
      icon: 'assets/ophtalmo.png',
      color: 'linear-gradient(135deg, #42A5F5, #64B5F6)',
      conseils: [
        'Faites examiner vos yeux régulièrement (tous les 1-2 ans).',
        'Portez des lunettes de soleil avec protection UV.',
        'Reposez vos yeux toutes les 20 minutes lors du travail sur écran.',
        'Maintenez une distance appropriée avec les écrans (règle 20-20-20).',
        'Adoptez une alimentation riche en vitamines A, C et E.',
        'Contrôlez votre glycémie si vous êtes diabétique.',
        'Ne frottez pas vos yeux avec les mains sales.',
        'Consultez rapidement en cas de vision floue ou douleur oculaire.',
        'Utilisez un bon éclairage pour lire ou travailler.',
        'Retirez vos lentilles avant de dormir selon les recommandations.'
      ]
    },
    'endocrinologie': {
      id: 'endocrinologie',
      name: 'Endocrinologie',
      icon: 'assets/endocrino.png',
      color: 'linear-gradient(135deg, #AB47BC, #BA68C8)',
      conseils: [
        'Surveillez votre glycémie si vous êtes à risque de diabète.',
        'Maintenez un poids santé pour l\'équilibre hormonal.',
        'Consommez du sel iodé pour la santé de votre thyroïde.',
        'Faites vérifier votre fonction thyroïdienne régulièrement.',
        'Gérez votre stress qui affecte vos hormones.',
        'Adoptez une alimentation équilibrée pauvre en sucres rapides.',
        'Pratiquez une activité physique régulière.',
        'Consultez en cas de fatigue inexpliquée ou changements de poids.',
        'Surveillez les signes de déséquilibre hormonal.',
        'Prenez vos traitements hormonaux selon les prescriptions.'
      ]
    },
    'gastro': {
      id: 'gastro',
      name: 'Gastro-entérologie',
      icon: 'assets/gastroo.png',
      color: 'linear-gradient(135deg, #26A69A, #4DB6AC)',
      conseils: [
        'Adoptez une alimentation riche en fibres pour la santé digestive.',
        'Hydratez-vous suffisamment pour faciliter le transit.',
        'Mastiquez bien vos aliments pour faciliter la digestion.',
        'Évitez les aliments gras et épicés si vous êtes sensible.',
        'Limitez la consommation d\'alcool qui irrite le système digestif.',
        'Ne fumez pas, le tabac aggrave les troubles digestifs.',
        'Gérez votre stress qui peut perturber la digestion.',
        'Consultez en cas de douleurs abdominales persistantes.',
        'Faites un dépistage du cancer colorectal après 50 ans.',
        'Évitez l\'automédication prolongée avec des anti-inflammatoires.'
      ]
    },
    'psychiatrie': {
      id: 'psychiatrie',
      name: 'Psychiatrie',
      icon: 'assets/psy.png',
      color: 'linear-gradient(135deg, #5C6BC0, #7986CB)',
      conseils: [
        'N\'hésitez pas à consulter un professionnel en cas de détresse psychologique.',
        'Pratiquez des activités qui vous procurent du plaisir.',
        'Maintenez des liens sociaux et parlez de vos émotions.',
        'Adoptez une routine de sommeil régulière.',
        'Pratiquez la méditation ou des techniques de relaxation.',
        'Limitez la consommation d\'alcool et de substances.',
        'Faites de l\'exercice physique régulier pour votre bien-être mental.',
        'Apprenez à reconnaître les signes de dépression ou d\'anxiété.',
        'Prenez vos traitements psychotropes selon les prescriptions.',
        'Demandez de l\'aide immédiate si vous avez des pensées suicidaires.'
      ]
    }
  };

  // ========================================
  // MÉTHODES POUR LA VIDÉO HERO
  // ========================================
 ngAfterViewInit(): void {
  const vid = this.video.nativeElement;
  vid.muted = true;

  vid.play().catch(err => {
    console.warn('Autoplay bloqué par le navigateur', err);
  });

  // Animation titres
  this.titleInterval = setInterval(() => {
    this.changeContent();
  }, 5000);

  // ✅ OBSERVER STATS AU SCROLL (ICI ET PAS AILLEURS)
  const statsSection = document.querySelector('.stats-section');

  if (statsSection) {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateStats();
        }
      });
    }, { threshold: 0.4 });

    this.observer.observe(statsSection);
  }
}


  changeContent(): void {
  this.titleAnimating = false;
  this.subtitleAnimating = false;
  this.buttonAnimating = false;

  setTimeout(() => {
    this.currentTitleIndex =
      (this.currentTitleIndex + 1) % this.titles.length;

    this.currentTitle = this.titles[this.currentTitleIndex];
    this.currentSubtitle = this.subtitles[this.currentTitleIndex];

    this.titleAnimating = true;
    this.subtitleAnimating = true;
    this.buttonAnimating = true;
  }, 50);

    const statsSection = document.querySelector('.stats-section');

if (statsSection) {
  this.observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.statsAnimated) {
        this.statsAnimated = true;
        this.animateStats();
      }
    });
  }, { threshold: 0.4 });

  this.observer.observe(statsSection);
}


  }
  

  // ========================================
  // MÉTHODES POUR LES CONSEILS MÉDICAUX
  // ========================================
  openModal(specialtyId: string): void {
    this.currentSpecialty = this.specialties[specialtyId];
    this.isModalOpen = true;
    // Empêche le scroll du body quand le modal est ouvert
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    // Réactive le scroll du body
    document.body.style.overflow = 'auto';
  }/* =========================
   ANIMATION STATS AU SCROLL
========================= */



  // ========================================
  // NETTOYAGE
  // ========================================
  ngOnDestroy(): void {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    document.body.style.overflow = 'auto';
  }
}
