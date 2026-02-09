import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMedecinsComponent } from './gestion-medecins.component';

describe('GestionMedecinsComponent', () => {
  let component: GestionMedecinsComponent;
  let fixture: ComponentFixture<GestionMedecinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionMedecinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionMedecinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
