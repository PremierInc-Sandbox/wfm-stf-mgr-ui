import {Component, ViewChild} from '@angular/core';
import {SidenavComponent} from '../sidenav/sidenav.component';
import {UserService} from '../../service/user.service';
import {EnvironmentService} from '../../service/environment.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('sideNav') sideNav: SidenavComponent;

  userImageLocationStyle: string;
  profileImageUrl = 'https://premierconnectdevi.premierinc.com/profile/api/picture/uid';

  constructor(userService: UserService, environmentService: EnvironmentService) {

    this.userImageLocationStyle = 'url(' + this.profileImageUrl + '/' + userService.user.userName + ')';

  }

  onProfileClick() {
    this.sideNav.toggle();
  }

}
