import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OffGridActvitiesModule} from './off-grid-activities/off-grid-actvities.module';
import {PlanSetupModule} from './plan-setup/plan-setup.module';
import {StaffScheduleModule} from './staff-schedule/staff-schedule.module';
import {StaffingGridModule} from './staffing-grid/staffing-grid.module';
import {HomeModule} from './home/home.module';
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HomeModule,
    OffGridActvitiesModule,
    StaffScheduleModule,
    StaffingGridModule,
    PlanSetupModule
  ]
})
export class StaffPlannerModule { }
