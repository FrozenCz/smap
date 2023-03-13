import {Component} from '@angular/core';
import {firstValueFrom, map, Observable} from 'rxjs';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {AppService} from '~/app/app.service';
import {LocationNfc, LocationRegisterService} from '~/app/services/location-register.service';


@Component({
  selector: 'ns-send-data',
  templateUrl: './send-data.component.html',
  styles: ['Button{font-size:30}']
})
export class SendDataComponent {
  locationToRegister$: Observable<number>;

  constructor(private _appService: AppService, private locationRegisterService: LocationRegisterService) {
    this.locationToRegister$ = this.locationRegisterService.getLocationsForRegister$().pipe(map(loc => loc.length))
  }


  sendAllData() {

  }

  async sendLocationRegistration(): Promise<void> {
    const locations: LocationNfc[] = await firstValueFrom(this.locationRegisterService.getLocationsForRegister$());
    locations.forEach(location => {
      firstValueFrom(this._appService.setNfcIdForLocation(location.locationUuid, location.tagId)).then(() => {
        const snackBar = new SnackBar();
        this.locationRegisterService.remove(location.locationUuid);
        snackBar.action({
          message: 'NFC štítek úspěšně přiřazen k lokaci',
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
      })
    })

  }

  sendItemsLocation() {
    firstValueFrom(this._appService.sendItemsLocation()).then(() => {
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
