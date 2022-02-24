import {Component, HostListener} from '@angular/core';
import {Log} from '../../service/log';
import {UserService} from '../../service/user.service';
import {PageRedirectionService} from '../../service/page-redirection.service';
import {User} from '../../domain/user';
import {HttpClient} from '@angular/common/http';
import {PlanService} from '../../service/plan-service';
import {ProductHelp} from '../../domain/product-help';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  state = 'inactive';
  user: User;
  productHelp: ProductHelp;

  @HostListener('document:click', ['$event'])
  clickedOutside($event) {
    if (event.target['id'] !== 'userImage' && this.state === 'active') {
      this.state = 'inactive';
    }
  }


  constructor(private userService: UserService,
              private pageRedirectionService: PageRedirectionService,
              private planService: PlanService,
              private http: HttpClient) {
    this.user = this.userService.user;
    this.productHelp = new ProductHelp();
  }

  toggle() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
  clickedInside($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();  // <- that will stop propagation on lower layers
  }

  logout() {
    if (confirm('Warning: Logging out of this application will log you out of all open Premier product applications. ' +
      'Do you wish to continue with logout?')) {
      sessionStorage.removeItem('reload');
      this.userService.logout().subscribe(() => {
        localStorage.setItem('loginAttribute','logout');
        Log.info('User logged out successfully.');
        this.planService.getRedirectUrl().subscribe(data => {
          this.productHelp.logoutUrl = data.logoutUrl;
          this.productHelp.environmentName = data.environmentName;
          this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
        });
      }, error => {
        Log.error('Error logging user out.');
        this.pageRedirectionService.redirectToLogout();
      }, () => {
      });
    }
  }

  productDocumentationHelp() {
    this.planService.getRedirectUrl().subscribe(data => {
      this.productHelp.productHelpUrl = data.productHelpUrl;
      window.open(this.productHelp.productHelpUrl);
    });
  }
}
