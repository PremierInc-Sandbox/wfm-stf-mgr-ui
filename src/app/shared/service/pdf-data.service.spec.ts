import {TestBed} from '@angular/core/testing';
import {Observable, observable, of} from 'rxjs';
import {PdfDataService} from './pdf-data.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {planDetailsData} from './fixtures/plan-details-data';

describe('PdfDataServiceService', () => {
  let service: PdfDataService;
  let httpMock: HttpTestingController;
  const testPlanDetailsData = planDetailsData();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PdfDataService]
    });
    service = TestBed.get(PdfDataService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const pdfDataService: PdfDataService = TestBed.get(PdfDataService);
    expect(pdfDataService).toBeTruthy();
  });

  it('should create pdf', () => {
    let response = new Blob();
    service.createPdf(testPlanDetailsData[0], 'scheduleKey', 'asc' , 'File');
    httpMock.expectOne({
      url: '/pcops/staff-scheduler-rest/generate-pdf',
      method: 'POST'
    }).flush(response);
  });
});
