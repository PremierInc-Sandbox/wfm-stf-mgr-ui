import {combineLatest, Observable, zip as observableZip} from 'rxjs';
import {Injectable} from '@angular/core';
import {distinctUntilChanged, map, share} from 'rxjs/operators';
import {PageRedirectionService} from './page-redirection.service';
import {environment} from '../../../environments/environment';
import {Environment} from '../domain/environment';
import {UserService} from './user.service';

@Injectable()
export class EnvironmentService {

  private _currentEnvironment: Environment;
  private _environmentObserver: Observable<any>;
  private _localMessages = environment;

  constructor(private userService: UserService,
              private pageRedirectionService: PageRedirectionService) {
  }

  get current() {
    return this._currentEnvironment;
  }

  refreshEnvironment(): Observable<any> {

    this._environmentObserver = this.userService.refreshUser();

     // this._environmentObserver = observableZip(
     //   this.userService.refreshUser()
     // ).pipe(
     //   map(sources => {
     //     if (sources.length < 1) {
     //       // Sanity check error
     //       this.pageRedirectionService.redirectAccordingToResponseCode({ status: 500 });
     //       return new Environment([this._localMessages]);
     //     }
     //
     //     const backendMessages = sources[0];
     //    // Order matter here, local trumps backend messages
     //     return new Environment([this._localMessages, backendMessages]);
     //   })
     // );
   this._environmentObserver.subscribe(
      (environment) => {
        this._currentEnvironment = environment;
      }
    );

   return this._environmentObserver;
  }

  async initialize() {
    return new Promise<void>((resolve, reject) => {

      this.refreshEnvironment()
        .subscribe(resolve, reject);

    });
  }

  get environment() {
    return this._currentEnvironment;
  }

  get environmentObserver() {
    return this._environmentObserver;
  }

  get(key: string, defaultValue?: undefined): string {
    return this._currentEnvironment.get(key, defaultValue);
  }

  observeKey(key: string): Observable<string> {
    return this._environmentObserver
      .pipe(
        map(env => env.get(key)),
        distinctUntilChanged()
      );
  }

  observeKeys(...keys: string[]): Observable<string[]> {
    return combineLatest(
      keys.map(key => this.observeKey(key))
    );
  }


}
