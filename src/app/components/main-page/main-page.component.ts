import {Component, OnInit} from '@angular/core';
import {AppService} from '~/app/app.service';
import {firstValueFrom} from 'rxjs';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';

@Component({
  selector: 'ns-main-page',
  templateUrl: './main-page.component.html',
  styles: ['Button{font-size:30}']
})
export class MainPageComponent implements OnInit {
  constructor(private _appService: AppService) {
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

  sendData() {
    firstValueFrom(this._appService.sendData()).then(() => {
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'Data odeslána',
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
}
