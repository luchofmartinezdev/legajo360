import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailDialog } from './employee-detail-dialog';

describe('EmployeeDetailDialog', () => {
  let component: EmployeeDetailDialog;
  let fixture: ComponentFixture<EmployeeDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
