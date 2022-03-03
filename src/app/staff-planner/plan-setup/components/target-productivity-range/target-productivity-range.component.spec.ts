import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TargetProductivityRangeComponent} from './target-productivity-range.component';
import {FormsModule} from '@angular/forms';

describe('TargetProductivityRangeComponent', () => {
  let component: TargetProductivityRangeComponent;
  let fixture: ComponentFixture<TargetProductivityRangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TargetProductivityRangeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetProductivityRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should emit be called by upperBoundTextboxChange with plan.upperEndTarget and set isSaveNextBtnSubmit to false', () => {
    const emit = spyOn(component.upperBoundTextboxChange, 'emit');
    component.onUpperBoundTextboxChangeMethod(60);
    expect(component.isSaveNextBtnSubmit).toBeFalsy();
    expect(emit).toHaveBeenCalledWith(component.plan.upperEndTarget);
  });
  it('should emit be called by upperBoundTextboxChange with plan.upperEndTarget and set isSaveNextBtnSubmit to true', () => {
    const emit = spyOn(component.upperBoundTextboxChange, 'emit');
    component.onUpperBoundTextboxChangeMethod(40);
    expect(component.isSaveNextBtnSubmit).toBeTruthy();
    expect(emit).toHaveBeenCalledWith(component.plan.upperEndTarget);
  });
  it('should emit be called by lowerBoundTextboxChange with plan.lowerEndTarget and set isSaveNextBtnSubmit to false', () => {
    const emit = spyOn(component.lowerBoundTextboxChange, 'emit');
    component.onLowerBoundTextBoxChanges(60);
    expect(component.isSaveNextBtnSubmit).toBeFalsy();
    expect(emit).toHaveBeenCalledWith(component.plan.lowerEndTarget);
  });
  it('should emit be called by lowerBoundTextboxChange with plan.planParameter.lowerEndTarget and set isSaveNextBtnSubmit to true', () => {
    const emit = spyOn(component.lowerBoundTextboxChange, 'emit');
    component.onLowerBoundTextBoxChanges(40);
    expect(component.isSaveNextBtnSubmit).toBeTruthy();
    expect(emit).toHaveBeenCalledWith(component.plan.lowerEndTarget);
  });
  it('should validate lower length is > 2', () => {
    component.plan.lowerEndTarget = 'event';
    expect(component.validateLowerLength('event')).toBe(false);
  });
  it('should validate lower length < 2', () => {
    component.plan.lowerEndTarget = 'e';
    expect(component.validateLowerLength('e')).toBe(true);
  });
  it('should validate upper length is > 2', () => {
    component.plan.upperEndTarget = 'event';
    expect(component.validateUpperLength('event')).toBe(false);
  });
  it('should validate upper length < 2', () => {
    component.plan.upperEndTarget = 'e';
    expect(component.validateUpperLength('e')).toBe(true);
  });
  it('should check target upper end ', () => {
    expect(component.checkTargetChanges(true, true, true, true)).toBe(true);
  });
  it('should check target upper end', () => {
    expect(component.checkTargetChanges(false, true, true, true)).toBe(true);
  });
  it('should check target upper end', () => {
    expect(component.checkTargetChanges(true, true, true, false)).toBe(true);
  });
});
