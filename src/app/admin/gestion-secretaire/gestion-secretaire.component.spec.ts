import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSecretaireComponent } from './gestion-secretaire.component';

describe('GestionSecretaireComponent', () => {
  let component: GestionSecretaireComponent;
  let fixture: ComponentFixture<GestionSecretaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSecretaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSecretaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
