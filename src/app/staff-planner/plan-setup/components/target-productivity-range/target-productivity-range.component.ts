import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';

@Component({
  selector: 'app-target-productivity-range',
  templateUrl: './target-productivity-range.component.html',
  styleUrls: ['./target-productivity-range.component.scss']
})
export class TargetProductivityRangeComponent implements OnInit {

  @Output() lowerBoundTextboxChange = new EventEmitter();
  @Output() upperBoundTextboxChange = new EventEmitter();
  @Input('plan') plan: PlanDetails;
  lowerEnd = 100;
  upperEnd = 120;
  @Input('isSaveNextBtnSubmit') isSaveNextBtnSubmit: boolean;
  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.plan.lowerEndTarget === undefined && this.plan.upperEndTarget === undefined) {
      this.plan.lowerEndTarget = 100;
      this.plan.upperEndTarget = 120;
    }
    if (this.plan.lowerEndTarget === null && this.plan.upperEndTarget === null) {
      this.plan.lowerEndTarget = 100;
      this.plan.upperEndTarget = 120;
    }
  }
  constructor() {
    this.plan = new PlanDetails();
    this.plan.lowerEndTarget = 100;
  }
  onUpperBoundTextboxChangeMethod(valueLower) {
    this.isSaveNextBtnSubmit = !(valueLower > 50 && valueLower < 200);
    this.upperBoundTextboxChange.emit(this.plan.upperEndTarget);
  }

  onLowerBoundTextBoxChanges(valueUpper) {
    this.isSaveNextBtnSubmit = !(valueUpper > 50 && valueUpper < 200);
    this.lowerBoundTextboxChange.emit(this.plan.lowerEndTarget);
  }

  validateLowerLength(event) {
    return this.plan.lowerEndTarget.toString().length <= 3;
  }
  validateUpperLength(event) {
    if (this.plan.upperEndTarget.toString().length > 3) {
      return false;
    }
    return true;
  }

  checkTargetUpperEnd(targetUpperEndValue: number, targetLowerEndValue: number) {
    return targetUpperEndValue != null && targetUpperEndValue < targetLowerEndValue;
  }

  checkTargetChanges(targetLowerEndTouched: boolean, targetLowerEndDirty: boolean,
                     targetUpperEndTouched: boolean, targetUpperEndDirty: boolean) {
    return (targetLowerEndTouched && targetLowerEndDirty) && (targetUpperEndTouched && targetUpperEndDirty) ||
      (targetLowerEndTouched && targetLowerEndDirty) || (targetUpperEndTouched && targetUpperEndDirty);
  }
}

