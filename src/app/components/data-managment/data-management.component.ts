import {Component} from '@angular/core';
import {ApplicationSettings} from '@nativescript/core';
import {AppService} from '~/app/app.service';
import {firstValueFrom} from 'rxjs';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {Dialogs} from '@nativescript/core';


@Component({
  selector: 'ns-data-management',
  templateUrl: 'data-management.component.html',
  styles: ['Button{font-size:30}']
})
export class DataManagementComponent {

  constructor(private _appService: AppService) {
  }


  loadData() {
    firstValueFrom(this._appService.reloadData()).then(() => {
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'Data doplněna',
        backgroundColor: 'green',
        textColor: 'white',
        hideDelay: 2000
      })
    }, reason => {
      console.log(reason);
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'Došlo k chybě',
        hideDelay: 2000,
        backgroundColor: 'red',
        textColor: 'black',
      })
    });
  }

  resetData() {
    Dialogs.confirm({message: 'Přepsání dat bude znamenat smazání veškerého obsahu ze začízení a nahrání nových dat ze serveru. Skutečně chcete tuto akci provést?', title: 'Přepsání dat', okButtonText: 'ANO přepsat', neutralButtonText: 'Zrušit'})
      .then((result) => {
        if(result) {
          ApplicationSettings.clear();
          this.loadData()
        }
      })


  }
}
