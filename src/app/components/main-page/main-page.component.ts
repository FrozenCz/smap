import {Component, OnInit} from '@angular/core';
import {AppService} from '~/app/app.service';
import {firstValueFrom, Observable, tap} from 'rxjs';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {AuthService, JwtToken} from '~/app/services/auth.service';

@Component({
  selector: 'ns-main-page',
  templateUrl: './main-page.component.html',
  styles: ['Button{font-size:30}']
})
export class MainPageComponent implements OnInit {
  loggedUser$: Observable<JwtToken | null>;
  userName: string = 'spravceA';
  password: string = 'Test123!';
  userLogged: boolean = false;

  constructor(private _appService: AppService, private authService: AuthService) {
    this.loggedUser$ = this.authService.user$().pipe(tap(token => this.userLogged = !!token));
  }

  ngOnInit() {
  }


  loadData(): void {
    firstValueFrom(this._appService.reloadData()).then(() => {
      const snackBar = new SnackBar();
      snackBar.action({

        message: 'Data stažena',
        backgroundColor: 'green',
        textColor: 'white',
        hideDelay: 2000
      })
    }, reason => {
      const snackBar = new SnackBar();
      snackBar.showSnack({
        message: 'Došlo k chybě',
        backgroundColor: 'red',
        textColor: 'white',
        hideDelay: 2000
      })
    })
  }




  logIn(userName: string, password: string): void {
    firstValueFrom(this.authService.login(userName, password)).then(() => {
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'V pořádku',
        backgroundColor: 'green',
        textColor: 'white',
        hideDelay: 2000
      })
    }, reason => {
      const snackBar = new SnackBar();
      snackBar.showSnack({
        message: 'Došlo k chybě',
        backgroundColor: 'red',
        textColor: 'white',
        hideDelay: 2000
      })
    })
  }

  logOut() {
    this.authService.logOut()
  }
}
