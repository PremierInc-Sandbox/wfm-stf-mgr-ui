import {Injectable} from '@angular/core';
import {environment as env} from '../../../environments/environment';
import * as template from 'url-template';

interface Template {
  expand(params: any): string;
}

@Injectable()
export class PageRedirectionService {

  public whoopsUrl: Template = template.parse(env['url.whoops']);
  public logoutUrl: Template = template.parse(env['url.logout']);
  private productHelpUrl: Template = template.parse(env['url.help']);
  public window: Window;

  constructor(
  ) {
    this.window = window;
  }

  redirectToExternalPage(url) {
    // TODO: Eventually make this use the angular router
    this.window.location.href = url;
  }

  redirectToWhoopsPage(errorCode) {
    if (errorCode) {
      errorCode = '';
    }
    this.redirectToExternalPage(this.whoopsUrl.expand({errorCode}));
  }

  redirectToLogout() {
    this.redirectToExternalPage(this.logoutUrl.expand({}));
  }

  redirectAccordingToResponseCode(response) {
    if (response.status === 302 && response.config.headers) { // Redirect
      const headers = response.config.headers;
      this.redirectToExternalPage(headers.location);
    } else { // Other Problem
      this.redirectToWhoopsPage(this.generateErrorCode(response.status));
    }
  }

  public getProductHelpUrl(): string {
    return String(this.productHelpUrl.expand({}));
  }

  generateErrorCode(statusCode) {
    let errorCode = '';
    if (statusCode === 400) {
      errorCode = '0x38cf0424';
    } else if (statusCode === 401) {
      errorCode = '0x38cf0425';
    } else if (statusCode === 403) {
      errorCode = '0x38cf0427';
    } else if (statusCode === 404) {
      errorCode = '0x38cf0428';
    } else if (statusCode === 405) {
      errorCode = '0x38cf042c';
    } else if (statusCode === 500) {
      errorCode = '0x38cf042f';
    } else if (statusCode === 501) {
      errorCode = '0x38cf0430';
    } else if (statusCode === 502) {
      errorCode = '0x38cf0431';
    } else if (statusCode === 503) {
      errorCode = '0x38cf0432';
    } else if (statusCode === 504) {
      errorCode = '0x38cf0433';
    }

    return errorCode;
  }
}
