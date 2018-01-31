import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DinerDeciderComponent } from './diner-decider.component';

describe('DinerDeciderComponent', () => {
  let component: DinerDeciderComponent;
  let fixture: ComponentFixture<DinerDeciderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DinerDeciderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DinerDeciderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
