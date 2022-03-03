import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InternalServerComponent} from '../shared/components/error-pages/internal-server/internal-server.component';
import {NotFoundComponent} from '../shared/components/error-pages/not-found/not-found.component';
import {StaffManagerComponent} from './home/pages/home.component';
import {StaffManagerPlanComponent} from './staff-manager-plan/pages/staff-manager-plan.component';
import {CanDeactivateGuard} from "../shared/guard/can-deactivate-guard.service";

export const routes: Routes = [ 
  { path: '404', component: NotFoundComponent},
  { path: '500', component: InternalServerComponent },
  {path: 'staff-manager', component: StaffManagerComponent,canDeactivate:[CanDeactivateGuard]},
  {path: 'plan-manager', component: StaffManagerPlanComponent,canDeactivate:[CanDeactivateGuard]}
];
