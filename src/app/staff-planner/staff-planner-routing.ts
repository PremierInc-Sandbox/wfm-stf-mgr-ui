import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanListComponent} from './home/pages/home.component';
import {PlanSetupComponent} from './plan-setup/pages/plan-setup.component';
import {PlanModalComponent} from './plan-setup/components/plan-modal/plan-modal.component';
import {OffGridActivitiesComponent} from './off-grid-activities/pages/off-grid-activities.component';
import {InternalServerComponent} from '../shared/components/error-pages/internal-server/internal-server.component';
import {NotFoundComponent} from '../shared/components/error-pages/not-found/not-found.component';
import {CopyPlanModalComponent} from './home/components/copy-plan-modal/copy-plan-modal.component';
import {StaffScheduleComponent} from './staff-schedule/pages/staff-schedule.component';
import {StaffingGridComponent} from './staffing-grid/pages/staffing-grid.component';
import {SubmitPlanModelComponent} from './staffing-grid/components/submit-plan-model/submit-plan-model.component';
import {CanDeactivateGuard} from "../shared/guard/can-deactivate-guard.service";
import {NoAccessComponent} from "../shared/components/error-pages/no-access/not-found.component";

export const routes: Routes = [
  {path: 'plan-list', component: PlanListComponent,canDeactivate:[CanDeactivateGuard]},
  {path: '', redirectTo: 'plan-list', pathMatch: 'full'},
  {path: 'plan-setup', component: PlanSetupComponent,canDeactivate:[CanDeactivateGuard]},
  {path: 'off-grid-activities', component: OffGridActivitiesComponent,canDeactivate:[CanDeactivateGuard]},
  {path: 'staff-schedule', component: StaffScheduleComponent, canDeactivate:[CanDeactivateGuard]},
  {path: 'plan-modal', component: PlanModalComponent},
  {path: 'copy-plan-modal', component: CopyPlanModalComponent},
  {path: 'home', component: PlanListComponent},
  { path: '404', component: NotFoundComponent},
  { path: '500', component: InternalServerComponent },
  {path: 'staffing-grid', component: StaffingGridComponent,canDeactivate:[CanDeactivateGuard]},
  {path: 'sumbit-plan-modal', component: SubmitPlanModelComponent},
  {path: 'no-access' , component: NoAccessComponent}
];
