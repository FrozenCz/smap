import {Component, OnInit} from '@angular/core';
import {Nfc} from 'nativescript-nfc';
import {firstValueFrom, Observable} from 'rxjs';
import {AppService} from '~/app/app.service';
import {LocationModel} from '~/app/model/location.model';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';


@Component({
  selector: 'ns-location-register',
  templateUrl: './location-register.component.html',
})
export class LocationRegisterComponent implements OnInit {
  nfc: typeof android.nfc;
  avail = false;
  enabled = false;
  tagId: null | string = null;
  locations$: Observable<LocationModel[]>
  selectedLocation: LocationModel | null = null;


  constructor(private _appService: AppService) {
    this.locations$ = this._appService.getLocations$();
  }


  ngOnInit() {


    let nfc = new Nfc();
    nfc.available().then(avail => {
      this.avail = avail;
      if (avail) {
        nfc.enabled().then(on => {
          this.enabled = on;

          nfc.setOnNdefDiscoveredListener((data) => {
            const serialHex = AppService.convertToHex(data.id)
            // console.log(serialHex);
            this.tagId = serialHex;
          })

          nfc.setOnTagDiscoveredListener((data) => {
            const serialHex = AppService.convertToHex(data.id)
            // console.log(serialHex);
            this.tagId = serialHex;
          })

        })
      }
    })
  }

  setNfcIdForLocation(selectedLocation: LocationModel, tagId: string) {
    firstValueFrom(this._appService.setNfcIdForLocation(selectedLocation.uuid, tagId)).then(() => {
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'NFC štítek úspěšně přiřazen k lokaci',
        backgroundColor: 'green',
        textColor: 'white',
        hideDelay: 2000
      })
      this.tagId = null;
      this.selectedLocation = null;
    }, reason => {
      const snackBar = new SnackBar();
      snackBar.action({
        message: 'Došlo k chybě',
        hideDelay: 2000,
        backgroundColor: 'red',
        textColor: 'black',
      })
    })
  }
}
