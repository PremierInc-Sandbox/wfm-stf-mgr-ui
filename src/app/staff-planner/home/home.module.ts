import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PlanListComponent} from './pages/home.component';
import {SharedModule} from '../../shared/shared.module';
import {MaterialModule} from '../../shared/material.module';
import {CopyPlanModalComponent } from '../home/components/copy-plan-modal/copy-plan-modal.component';
@NgModule({
  declarations: [
    PlanListComponent,
    CopyPlanModalComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule
  ]
})
export class HomeModule { }
