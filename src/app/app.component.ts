import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UrgenceModalComponent } from './urgence-modal/urgence-modal.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UrgenceModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MediConnect';
  showNavbar = true;
  showFooter = true;

  // Avis
  avisMessage = '';
  avisEnvoi   = false;
  avisEnvoye  = false;
  avisErreur  = false;

  private apiUrl = 'http://localhost:3000/api';

  @ViewChild('urgenceModal') urgenceModal!: UrgenceModalComponent;

  constructor(private router: Router, private http: HttpClient) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const nav = event as NavigationEnd;
        const url = nav.urlAfterRedirects || nav.url;

        const hideOn = [
          '/login',
          '/register',
          '/register-med',
          '/register-sec',
          '/home-user',
          '/home-med',
          '/home-sec',
          '/admin'
        ];

        const shouldHide = hideOn.some(path => url.startsWith(path));
        this.showNavbar = !shouldHide;
        this.showFooter = !shouldHide;
      });
  }

  ngOnInit() {
    console.log('✅ Application MediConnect démarrée');
  }

  openUrgence() {
    if (this.urgenceModal) {
      this.urgenceModal.openModal();
    }
  }

  envoyerAvis() {
    if (!this.avisMessage.trim()) return;

    this.avisEnvoi  = true;
    this.avisErreur = false;

    this.http.post(`${this.apiUrl}/avis`, { message: this.avisMessage.trim() })
      .subscribe({
        next: () => {
          this.avisEnvoi  = false;
          this.avisEnvoye = true;
          this.avisMessage = '';
        },
        error: () => {
          this.avisEnvoi  = false;
          this.avisErreur = true;
        }
      });
  }
}