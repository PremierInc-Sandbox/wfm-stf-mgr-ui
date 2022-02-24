import {Injectable, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {NavigationCancel, NavigationEnd, NavigationStart, PRIMARY_OUTLET, Router, RouterEvent} from "@angular/router";
import {filter} from "rxjs/operators";
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RouterHistoryTrackerService implements OnDestroy {

  // subscription to router events to track changes
  private routerSubscription: Subscription;

  // url of current page (last successful navigation)
  private urlCurrent: string;
  // url of current page, parsed into segments (e.g. ["home","samplepage","1"])
  private urlCurrentSegmented: Array<string>;
  // id of current url
  private navIdCurrent: number;
  // state of current page
  private stateCurrent: any;


  //event id of most recent PRIOR navigation. Set by NavigationEnd handler.
  //If current page was reached imperatively or by clicking forward, id of page reached by going back
  //If current page was reached by going back, id of page reached by going forward
  private navIdHistorical: number;

  // direction to get to navIdHistorical (forward or back)
  // used in conjunction with navIdHistorical to determine
  // whether a popstate event is forward or back
  // if a popstate is navigating to an id that matches navIdHistorical
  // then we know we're going in navDirectionHistorical, otherwise, we're going the other way
  // set to "back" after an imperative navigation because only historical option is "back" after an imperative
  // navigation event, which becomes the new top-of-the stack
  private navDirectionHistorical: string;

  // holds restoredState nav id of current navigation. Populated whenever a popstate occurs
  private restoredStateNavId: number;

  // tracks whether currently active navigation was imperative or the result of a popstate
  private poppedState: boolean = false;

  // direction of current navigation
  // set each time a NavigationStart event occurs if triggered by popstate
  // determined by comparing destination of NavigationStart event to
  // navDirectionHistorical and navIdHistorical
  // initialized by first popstate NavigationStart
  private direction: string;

  //information needed to restore an item in the history stack
  //captured with each NavigationStart event
  private restoreState: any;
  private restoreUrl: string;

  // was cancellation invoked by a routeGuard?  If so, apply special procedures (below)
  // set and managed by each routeGuard; allows tracking to continue for any navigation
  // to preserve history, but only triggers restorative behavior when a guard is invoked
  // and navigation cancelled.
  private guardInvoked: boolean;

  public nextUrl: string;

  constructor(private router: Router, private location: Location) {
    this.urlCurrent = this.router.url;

    // set up subscription to router Start, End, and Cancel events for tracking and handling
    this.routerSubscription = router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.nextUrl = event.url
          this.navigationStartHandler(event);
        } else if (event instanceof NavigationEnd) {
          this.nextUrl = event.url
          this.navigationEndHandler(event)
        } else if (event instanceof NavigationCancel) {
          this.nextUrl = event.url
          this.navigationCancelHandler(event);
        }
      });
  }

  /**
   * Handler for navigationStartEvents
   * Determines direction of travel if popstate-triggered
   * Captures destination state info for use in event of cancellation
   * @param event a NavigationStart event
   */
  private navigationStartHandler(event: NavigationStart) {
    // popstate = back or forward clicked
    // if popstate, need to determine if it was back for forward pressed
    if (event.navigationTrigger == 'popstate') {
      this.poppedState = true;

      // restored state id is part of the NavigationStart event on a popstate event; capture it
      this.restoredStateNavId = event.restoredState ? event.restoredState.navigationId : null;

      // if restored state matches stored, then we're going in stored direction
      if (this.restoredStateNavId == this.navIdHistorical) {
        this.direction = this.navDirectionHistorical;
      }
      // otherwise, we're going in the opposite direction
      else {
        this.direction = this.navDirectionHistorical == 'back' ? 'forward' : 'back';
      }
    }
    //no popstate = imperative;
    else {
      this.direction = "imperative";
    }
    // on any navigation start, capture the details of the website we're starting to go to
    // in case it needs to be replaced in the stack (in the event of a popstate cancellation)
    this.setRestoreParams(this.location.path(), history.state);

  }

  /**
   * Handler for nagiationEnd Events
   * after a completed navigation:
   * 1. sets navDirectionHistorical which is the direction to get to the last-visited page.
   * 2. sets navIdHistorical which is the navigationId of the last-visited page
   * 3. captures current page info
   *
   * @param event a NavigationEnd Event
   */
  private navigationEndHandler(event: NavigationEnd) {
    // if navigating imperatively, the only available direction is back because top
    // of history stack is being replaced and the prior page is now accessible by going back
    if (!this.poppedState) { // imperative navigation
      this.navDirectionHistorical = "back";
    }
    // if navigation was triggered by popstate
    // and we just went forward, prior page is now accessible by clicking back
    // reset popped state for next navigation
    else if (this.direction == "forward") {
      this.navDirectionHistorical = "back";
      this.poppedState = false;
    }
    // if navigation was triggered by popstate and we just went back,
    // prior page is now accessible by clicking forward
    // reset popped state for next navigation
    else {
      this.navDirectionHistorical = "forward";
      this.poppedState = false;
    }
    // capture PRIOR navigation event Id
    // (which was stored in current after last navigation end)
    // and store it for comparison on next navigation
    this.navIdHistorical = this.navIdCurrent;

    // update current id, url, and state
    this.urlCurrent = event.url;
    this.navIdCurrent = event.id;
    this.stateCurrent = history.state;

    // parse current URL into segments to allow use of router.navigate to clean up after an imperative navigation below
    this.urlCurrentSegmented = new Array<string>()
    let k = this.router.parseUrl(event.url).root.children[PRIMARY_OUTLET]
    if (k) {
      k.segments.forEach(element => this.urlCurrentSegmented.push(element.path));
    }

    // after successful navigation, clear restoredId and direction
    this.clearDirectionAndRestoredId();
  }

  /**
   * handle cancellations for imperative and popstate navigation
   * @param event
   */
  private navigationCancelHandler(event: NavigationCancel) {
    // early exit if cancellation was not guard-invoked (set by authGuard)
    if (!this.guardInvoked) {
      return;
    }
    /*
    Special case for an imperative navigation
    A cancelled imperative naviagtion still gets stored as the lastNavigation
    within the router (this is the rawUrl value within the transitions object in the router).
    Because cancelled imperative navigations do not change the router
    state (url never changes; replaceState never called), we do not need to adjust state.
    However having the lastNavigation set to the cancelled URL is a problem,
    if the lastNavigation is the same as what we are going back or forward to
    to (i.e. page1 -[imperative]-> page2 -[imperative]-> page1[cancel] -[back]-> page1
    Under those circumstances, the router sees the lastNavigation and the actual previous
    navigation url as the same and skips the navigation by default.
    To get around this, we fire a non-state-changing navigation to the current URL,
    which doesn't touch state, but updates the lastNavigation stored by the router to
    reflect the current URL.  Enclosed in a timeout to prevent a navigation ID mismatch error
    when the router is changed multiple times in the same cycle
    */
    if (!this.poppedState) {
      setTimeout(() => {
        this.router.navigate(this.urlCurrentSegmented, {skipLocationChange: true});
      });
    }

    /* Popstate cancellation:
    On a popstate event, state (URL) changes as soon as navigation begins.
    On a popped state cancellation, the Angular will restore the state by calling replaceState
    on the new (cancelled) URL, replacing it with the URL that we started at.
    This action breaks history because the URL we cancelled gets removed from the stack
    (clobbered by the URL we started at during the replaceState) and there are now 2 entries
    on the stack for the URL we started at (one as a result of the replaceState and the original)
    To fix the issue, we reverse the router's replaceState by calling replaceState
    with the URL we cancelled so that it is put back in the correct stack position,
    and then we roll back the popstate by navigating back (if forward was clicked)
    or forward (if back was clicked)
    */

    // must have a restoreUrl (set in navigationStartHandler) to proceed
    if (this.poppedState && this.restoreUrl != undefined) {
      // reverse router's replaceState call by putting the cancelled destination URL back in the stack
      this.location.replaceState(this.restoreUrl, undefined, this.restoreState);

      if (this.direction == "forward") {
        this.location.back();
      } else {
        this.location.forward();
      }
      // clear restore params for next navigation
      this.resetRestoreParams();
      this.setGuardInvoked(false);
    }
    //reset popstate tracker for next navigation
    this.poppedState = false;

  }

  // getters/helper methods
  public getNavIdStored() {
    return this.navIdHistorical;
  }

  public getNavDirectionStored() {
    return this.navDirectionHistorical;
  }

  public getNavIdIdRestored() {
    return this.restoredStateNavId ? this.restoredStateNavId : null;
  }

  public getDirection() {
    return this.direction;
  }

  // called from routeGuard to invoke cancellation handler
  public setGuardInvoked(guardStatus: boolean) {
    this.guardInvoked = guardStatus;
  }

  // clear direction and restoredStateNavId for next run
  private clearDirectionAndRestoredId() {
    this.direction, this.restoredStateNavId = undefined;
  }

  // sets restore parameters for restoring stack after nav cancellation
  private setRestoreParams(restoreUrl: string, restoreState: any) {
    this.restoreUrl = restoreUrl;
    this.restoreState = restoreState;
  }

  // resets restore parameters
  private resetRestoreParams() {
    this.restoreUrl, this.restoreState = undefined;
  }

  public ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }
}
