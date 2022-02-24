import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '../../shared/material.module';
import {SharedModule} from '../../shared/shared.module';
import {PlanSetupComponent} from './pages/plan-setup.component'
import {CensusComponent} from './components/census/census.component'
import {NonVariablePosComponent} from './components/non-variable-pos/non-variable-pos.component'
import {PlanModalComponent} from './components/plan-modal/plan-modal.component'
import {TargetProductivityRangeComponent} from './components/target-productivity-range/target-productivity-range.component'
import {VariablePosComponent} from './components/variable-pos/variable-pos.component'
@NgModule({
  declarations: [
    PlanSetupComponent,
    CensusComponent,
    NonVariablePosComponent,
    PlanModalComponent,
    TargetProductivityRangeComponent,
    VariablePosComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule   
  ]
  ,exports: [],
  providers: [SharedModule]
})
export class PlanSetupModule { }
