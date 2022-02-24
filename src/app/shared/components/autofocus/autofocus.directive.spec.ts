import {AutofocusDirective} from './autofocus.directive';

describe('AutofocusDirective', () => {
  it('should create an instance', () => {
    const elRefMock = {
      nativeElement: document.createElement('input')
    };
    const directive = new AutofocusDirective(elRefMock);
    expect(directive).toBeTruthy();
  });

  it('should create an instance', () => {
    const elRefMock = {
      nativeElement: document.createElement('input')
    };
    elRefMock.nativeElement.setAttribute("id", "census-0");
    const directive = new AutofocusDirective(elRefMock);
    directive.ngAfterViewInit();
  });
});


