import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './shared/components/error-pages/not-found/not-found.component';
import {routes as staffPlannerRoutes} from './staff-planner/staff-planner-routing';
import {routes as staffManagerRoutes} from './staff-manager/staff-manager-routing';

export const routes: Routes = [
  {path: '', redirectTo: 'plan-list', pathMatch: 'full'},
  {
    path: '',
    children: [
      ...staffPlannerRoutes,
      ...staffManagerRoutes
    ]
  },
  {path: '**', component: NotFoundComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
