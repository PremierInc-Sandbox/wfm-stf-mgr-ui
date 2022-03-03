import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StaffManagerPlanComponent} from './pages/staff-manager-plan.component';
import {SharedModule} from '../../shared/shared.module';
import {MaterialModule} from '../../shared/material.module';
import { StaffManagerPlanCalculatorComponent } from './components/staff-manager-plan-calculator/staff-manager-plan-calculator.component';
import {OffGridActvitiesModule} from '../../staff-planner/off-grid-activities/off-grid-actvities.module';
import { StaffManagerPlanScoreCardComponent } from './components/staff-manager-plan-score-card/staff-manager-plan-score-card.component';
@NgModule({
  declarations: [StaffManagerPlanComponent, StaffManagerPlanCalculatorComponent, StaffManagerPlanScoreCardComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    OffGridActvitiesModule
  ]
})
export class StaffManagerPlanModule { }
