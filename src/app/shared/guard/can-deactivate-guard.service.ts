import { Injectable } from '@angular/core';
import {CanDeactivate} from "@angular/router";
import {Observable} from "rxjs";
import {AppComponent} from "../../app.component";
import {PlanSetupComponent} from "../../staff-planner/plan-setup/pages/plan-setup.component";
import {RouterHistoryTrackerService} from "../service/router-history-tracker.service";

export interface DeactivationGuarded {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<DeactivationGuarded> {
  constructor(private routerTracker : RouterHistoryTrackerService){
  }
  canDeactivate(component: DeactivationGuarded): Observable<boolean> | Promise<boolean> | boolean {
    if (component.canDeactivate === undefined){
      return;
    }

    else {
      //invoke history protection features of Router History Tracker Service to allow restoration
      //if navigation is cancelled.
      this.routerTracker.setGuardInvoked(true);
      return component.canDeactivate();
    }
  }
}
