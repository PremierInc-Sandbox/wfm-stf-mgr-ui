import {Component, OnInit, Input, DoCheck} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';


@Component({
  selector: 'app-grid-score-card',
  templateUrl: './grid-score-card.component.html',
  styleUrls: ['./grid-score-card.component.scss']
})
export class GridScoreCardComponent implements OnInit, DoCheck {
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  planWhpu: number;
  totalTargetWrkhrs: number;
  totalTargetWrkhrsFte: number;
  planTotalWrkhrs: number;
  planTotalWrkhrsFte: number;
  annualTotalHoursVarience: number;
  annualTotalHoursVarienceFte: number;
  isAnnualTotalHoursVariencepositive = false;
  showTotalPlanTargetHours = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    this.calculateScoreCardvalues();
  }

  calculateScoreCardvalues(): void {
    this.planWhpu = this.planDetails.totalAnnualHours / this.planDetails.totalAnnualVolume;
    this.totalTargetWrkhrs = Math.round(this.planDetails.targetBudget * this.planDetails.totalAnnualVolume);
    this.totalTargetWrkhrsFte = (this.planDetails.targetBudget * this.planDetails.totalAnnualVolume) / this.planDetails.fte;
    this.planTotalWrkhrs = Math.round(this.planDetails.totalAnnualHours);
    this.planTotalWrkhrsFte = this.planDetails.totalAnnualHours / this.planDetails.fte;
   // this.annualTotalHoursVarienceFte = ((this.planDetails.targetBudget * this.planDetails.totalAnnualVolume) -
   //   this.planDetails.totalAnnualHours) / this.planDetails.fte;

    let annualTotalHoursVariance = 0;
    if (this.planDetails.staffingSummaryData) {
      for (const staffSummary of this.planDetails.staffingSummaryData) {
        annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
      }
    }

    this.annualTotalHoursVarience = Math.round(annualTotalHoursVariance);
    this.isAnnualTotalHoursVariencepositive = this.annualTotalHoursVarience > 0;
    this.annualTotalHoursVarienceFte = this.annualTotalHoursVarience / this.planDetails.fte;
  }

  check(data: number): boolean {
    return isFinite(data);
  }

  isNumber(value): number{
    if (!isNaN(parseInt(value))) {
      return value;
    }
    return 0;
  }
}
