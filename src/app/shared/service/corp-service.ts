import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CorpDetails} from '../domain/CorpDetails';

@Injectable({
  providedIn: 'root'
})

export class CorpService {
  public fetchCorporationsUrl: string;

  constructor(private http: HttpClient) {
    this.fetchCorporationsUrl = '/pcops/staff-scheduler-rest/corporations';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getCorporations(): Observable<CorpDetails[]> {
    return this.http.get<CorpDetails[]>(this.fetchCorporationsUrl, this.httpOptions);
  }

}
