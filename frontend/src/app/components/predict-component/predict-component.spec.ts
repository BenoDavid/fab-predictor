import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictComponent } from './predict-component';

describe('PredictComponent', () => {
  let component: PredictComponent;
  let fixture: ComponentFixture<PredictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
