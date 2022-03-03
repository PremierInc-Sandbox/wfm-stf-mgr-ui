import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivityGridComponent} from './components/activity-grid/activity-grid.component';
import {OffGridActivitiesComponent} from './pages/off-grid-activities.component';
import {OgaTotalHoursComponent} from './components/oga-total-hours/oga-total-hours.component'
import {ScoreCardComponent} from './components/score-card/score-card.component'
import {MaterialModule} from '../../shared/material.module';
import {SharedModule} from '../../shared/shared.module';
@NgModule({
  declarations: [
    ActivityGridComponent,
    OffGridActivitiesComponent,
    OgaTotalHoursComponent,
    ScoreCardComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule
  ]
  , exports: [
    ScoreCardComponent
  ],
  providers: [SharedModule]
})
export class OffGridActvitiesModule { }
