import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFormDialog } from './employee-form-dialog';

describe('EmployeeFormDialog', () => {
  let component: EmployeeFormDialog;
  let fixture: ComponentFixture<EmployeeFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
