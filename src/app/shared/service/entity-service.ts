import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EntityDetails} from '../domain/EntityDetails';

@Injectable({
  providedIn: 'root'
})

export class EntityService {
  public entityDetailsUrl: string;

  constructor(private http: HttpClient) {
    this.entityDetailsUrl = '/pcops/staff-scheduler-rest/facilities/corporation/';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getFacility(corporationId: any): Observable<EntityDetails[]> {
    return this.http.get<EntityDetails[]>(this.entityDetailsUrl + corporationId, this.httpOptions);
  }

}
