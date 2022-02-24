import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeModule} from './home/home.module';
import {StaffManagerPlanModule} from './staff-manager-plan/staff-manager-plan.module'
@NgModule({
  declarations: [],
  imports: [
    HomeModule,
    StaffManagerPlanModule,
    CommonModule
  ]
})
export class StaffManagerModule { }
