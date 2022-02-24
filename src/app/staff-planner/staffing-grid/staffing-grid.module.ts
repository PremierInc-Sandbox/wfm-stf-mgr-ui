import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GridScoreCardComponent} from './components/grid-score-card/grid-score-card.component';
import {StaffingGridComponent} from './pages/staffing-grid.component';
import {StaffingMatrixComponent} from './components/staffing-matrix/staffing-matrix.component';
import {StaffingMatrixSummaryComponent} from './components/staffing-matrix-summary/staffing-matrix-summary.component';
import {MaterialModule} from '../../shared/material.module';
import {SubmitPlanModelComponent} from './components/submit-plan-model/submit-plan-model.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    GridScoreCardComponent,
    StaffingGridComponent,
    StaffingMatrixComponent,
    StaffingMatrixSummaryComponent,
    SubmitPlanModelComponent

  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule
  ],
  exports: [
    GridScoreCardComponent
  ],
  providers: [SharedModule]
})
export class StaffingGridModule {
}
