import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MineProfileComponent } from './mine-profile.component';

describe('MineProfileComponent', () => {
  let component: MineProfileComponent;
  let fixture: ComponentFixture<MineProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MineProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MineProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
