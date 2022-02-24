import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DeptDetails} from '../domain/DeptDetails';


@Injectable({
  providedIn: 'root'
})

export class DepartmentService {
  public fetchDepartmentUrl: string;

  constructor(private http: HttpClient) {
    this.fetchDepartmentUrl = '/pcops/staff-scheduler-rest/departments/facility/';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getDepts(facility: any): Observable<DeptDetails[]> {
    return this.http.get<DeptDetails[]>(this.fetchDepartmentUrl + facility, this.httpOptions);
  }

}
