import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '../../shared/material.module';
import {SharedModule} from '../../shared/shared.module';
import {StaffScheduleComponent} from './pages/staff-schedule.component'
import {ScheduleControlComponent} from './components/schedule-control/schedule-control.component'
import {ScheduleShiftComponent} from './components/schedule-shift/schedule-shift.component'
@NgModule({
  declarations: [
    StaffScheduleComponent,
    ScheduleControlComponent,
    ScheduleShiftComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule
  ]
  , exports: [],
  providers: [SharedModule]
})
export class StaffScheduleModule { }
