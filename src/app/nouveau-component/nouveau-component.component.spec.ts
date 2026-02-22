import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouveauComponentComponent } from './nouveau-component.component';

describe('NouveauComponentComponent', () => {
  let component: NouveauComponentComponent;
  let fixture: ComponentFixture<NouveauComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouveauComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouveauComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
