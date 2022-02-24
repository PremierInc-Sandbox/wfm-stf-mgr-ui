import {Injectable} from '@angular/core';
import {PlanDetails} from '../domain/plan-details';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PdfDataService {

  public createPdfUrl: string;

  constructor(private http: HttpClient) {
    this.createPdfUrl = '/pcops/staff-scheduler-rest/generate-pdf';
  }

  createPdf(plandetails: PlanDetails, scheduleKey: string, sortOrder: string, fileName: string) {
    const headers = new HttpHeaders({
      scheduleKey: scheduleKey.toString(),
      sortOrder: sortOrder
    });
    const pdfData = plandetails;
    this.http.post(this.createPdfUrl, pdfData, {headers, responseType: 'blob',withCredentials:true}).subscribe(
      response => {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(response, fileName + '.pdf');
        } else {
          const fileURL = URL.createObjectURL(response);
          const anchorTag = document.createElement('a');
          anchorTag.href = fileURL;
          anchorTag.download = fileName;
          anchorTag.click();
          window.URL.revokeObjectURL(fileURL);
        }
      },
      err => {}
    );
  }
}
