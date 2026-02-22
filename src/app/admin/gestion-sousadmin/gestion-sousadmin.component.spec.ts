import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSousAdminComponent } from './gestion-sousadmin.component';

describe('GestionSousAdminComponent', () => {
  let component: GestionSousAdminComponent;
  let fixture: ComponentFixture<GestionSousAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSousAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSousAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
