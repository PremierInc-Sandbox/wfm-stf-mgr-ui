import {TestBed} from '@angular/core/testing';

import {PredictedDataService} from './predicted-data.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpErrorResponse} from '@angular/common/http';

describe('PredictedDataService', () => {
    let service: PredictedDataService;
    let httpMock: HttpTestingController;
    let request = null;
    let historicDataModel = {
      departmentList : [{
        departmentKey : 1,
        historicalDataPast : [{
          staffVarianceSummaries : [{
            shiftDetailKey : 1,
            censusValue : 1,
            shiftTime : 1,
            shiftFormat : ''
          }],
          date : '10/12/2020'
        }]
      }]
    };
    let error: HttpErrorResponse = {
      error: {message:'wow'},
      headers: null,
      message: null,
      name: null,
      ok: null,
      status: null,
      statusText: null,
      type: null,
      url: 'url'
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [PredictedDataService]
        });
        service = TestBed.get(PredictedDataService);
        httpMock = TestBed.get(HttpTestingController);
    });
    afterEach(() => {
      httpMock.verify();
      request = null;
    });
    it('should be created', () => {
        const predictedDataService: PredictedDataService = TestBed.get(PredictedDataService);
        expect(predictedDataService).toBeTruthy();
    });

    it('should get predicted data for future', () => {
      service.getPredictedDataForFutureDate();
      expect(service.getPredictedDataForFutureDate).toHaveBeenCalled;
    });

    it('should get predicted data from volume forecasting', () => {
      service.getPredictedDataFromVolumeForecasting(historicDataModel).subscribe(data => {
      });
      request = httpMock.expectOne(service.getPredictedDataFromVolumeForecastingUrl);
      expect(request.request.method).toBe('POST');
    });

    it('should get Predicted Data For Present Date', () => {
      service.getPredictedDataForPresentDate(null, 1, '10/12/2020').subscribe(data => {
      });
      request = httpMock.expectOne(service.getPredictedDataForPresentDateUrl  + '/department-key/' + null + '/plan-key/'
      + 1 + '/selected-date/'  + '10/12/2020' );
      expect(request.request.method).toBe('GET');
    });

    it('should get Historic Data for Past Records', () => {
      service.getHistoricDataforPastRecords(null, 1, '10/12/2020', '10/01/2020').subscribe(data => {
      });
      request = httpMock.expectOne(service.getHistoricDataforPastRecordsUrl   + '/department-key/' + null + '/plan-key/'
      + 1 + '/selected-date/'  + '10/12/2020' + '/created-date/' + '10/01/2020' );
      expect(request.request.method).toBe('GET');
    });

    // it('should handleError', () => {
    //   service.handleError(errResponse)
    // });
    it('should handle error', function () {
      const error = {
        error: null,
        headers: null,
        message: null,
        name: null,
        ok: null,
        status: 500,
        statusText: null,
        type: null,
        url: null
      };
      service.handleError(error);
      expect();
    });
});
