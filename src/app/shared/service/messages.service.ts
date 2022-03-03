import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {URLS} from '../domain/urls';
import {Observable} from 'rxjs';
import {share} from 'rxjs/operators';
import {PageRedirectionService} from './page-redirection.service';

@Injectable()
export class MessagesService {

  private _messagesUrl = `${URLS.fetchMessages}/${MessagesService.getBrowserLanguage()}`;
  private _messagesObserver: Observable<any>;
  private _messages: any;

  constructor(private http: HttpClient, private _pageRedirectionService: PageRedirectionService) {}

  refreshMessages(): Observable<any> {
    this._messagesObserver = this.http.get(this._messagesUrl).pipe(share());
    // this._messagesObserver = of(messageFixture);

    this._messagesObserver.subscribe(messages => {
      this._messages = messages;
    }, error => {
      this._pageRedirectionService.redirectAccordingToResponseCode(error);
    });

    return this._messagesObserver;
  }

  get messagesObserver(): Observable<any> {
    return this._messagesObserver;
  }

  get messages(): any {
    return this._messages;
  }

  set messages(messages: any) {
    this._messages = messages;
  }

  getMessage(messageKey): string {
    if(this._messages && this._messages[messageKey]) {
      return this._messages[messageKey];
    }

    return null;
  }

  private static getBrowserLanguage(): string {
    let language = 'en_US';

    // @ts-ignore
    if (navigator.userLanguage) { // Explorer
      // @ts-ignore
      language = navigator.userLanguage;
    } else if (navigator.language) { // FF
      language = navigator.language;
    }

    return language;
  }
}
