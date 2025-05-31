import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseprojectsComponent } from './browseprojects.component';

describe('BrowseprojectsComponent', () => {
  let component: BrowseprojectsComponent;
  let fixture: ComponentFixture<BrowseprojectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseprojectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseprojectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
