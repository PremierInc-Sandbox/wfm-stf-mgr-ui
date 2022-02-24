import {TestBed, async} from '@angular/core/testing';

import {AppLoadService} from './app-load.service';
import {EnvironmentService} from './environment.service';
import { of} from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('AppLoadService', () => {
    let service: AppLoadService;
    const mockReturnValue = [1, 2, 3]; // change this!
    const environmentService: SpyObj<EnvironmentService> = jasmine.createSpyObj('EnvironmentService', ['initialize']);

    beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [AppLoadService, {provide: EnvironmentService, useValue: environmentService}]
        });
        service = TestBed.get(AppLoadService);
    });
    it('should be created', () => {
        const appLoadService: AppLoadService = TestBed.get(AppLoadService);
        expect(appLoadService).toBeTruthy();
    });

    it('Should initialize', async(() => {
        environmentService.initialize.and.returnValue(Promise.resolve());
        service.initializeApp();
    }));
});
