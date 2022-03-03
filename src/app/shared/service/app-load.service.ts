import {Injectable} from '@angular/core';
import {EnvironmentService} from './environment.service';

@Injectable()
export class AppLoadService {

  constructor(private _environmentService: EnvironmentService) {}

  async initializeApp() {
    return this._environmentService.initialize();
  }
}
