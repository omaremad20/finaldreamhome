import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotficationsComponent } from './notfications.component';

describe('NotficationsComponent', () => {
  let component: NotficationsComponent;
  let fixture: ComponentFixture<NotficationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotficationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotficationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
