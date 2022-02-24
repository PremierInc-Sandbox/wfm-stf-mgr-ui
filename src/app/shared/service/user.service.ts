import {Injectable} from '@angular/core';

import {BehaviorSubject,Observable, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, share} from 'rxjs/internal/operators';
import {User} from '../domain/user';
import {PageRedirectionService} from './page-redirection.service';
import {URLS} from '../domain/urls';
import { UserAccess } from '../domain/userAccess';

@Injectable()
export class UserService {

  private userObserver: Observable<User>;
  public userObj: User;

  private userAccessSource: BehaviorSubject<UserAccess>=new BehaviorSubject(new UserAccess);
  public userAccess = this.userAccessSource.asObservable();

  constructor(private http: HttpClient, private pageRedirectionService: PageRedirectionService) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  setUserAccess(value: UserAccess) {
    this.userAccessSource.next(value);
  }

  refreshUser(): Observable<any> {
    this.userObserver = this.http.get<User>(URLS.fetchUser).pipe(share());

    this.userObserver.subscribe((user) =>  {
      this.userObj = user;
    }, error => {
      this.pageRedirectionService.redirectAccordingToResponseCode(error);
    });
    return this.userObserver;
  }

  get fetchUserObserver(): Observable<User> {
    return this.userObserver;
  }

  get user(): User {
    return this.userObj;
  }

  set user(user: User) {
    this.userObj = user;
  }

  logout(): Observable<any> {
    this.userObj = null;
    return this.http.get<User>(URLS.logoutUser);
  }
  public fetchUserRole(): Observable<UserAccess> {
    return this.http.get<UserAccess>(URLS.fetchUserRole, this.httpOptions).pipe();
  }
}
