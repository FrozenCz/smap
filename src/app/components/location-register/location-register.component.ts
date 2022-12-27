import {Component, OnInit} from '@angular/core';
import {Nfc} from 'nativescript-nfc';
import {firstValueFrom, Observable} from 'rxjs';
import {AppService} from '~/app/app.service';
import {LocationModel} from '~/app/model/location.model';


@Component({
  selector: 'ns-location-register',
  templateUrl: './location-register.component.html',
})
export class LocationRegisterComponent implements OnInit {
  nfc: typeof android.nfc;
  avail = false;
  enabled = false;
  loaded: boolean = false;
  saved: boolean = false;
  tagId: null | string = null;
  tagId$: Observable<string | null>;
  locations: LocationModel[] = [];
  selectedLocation: LocationModel | null = null;


  constructor(private _appService: AppService) {
    firstValueFrom(this._appService.getLocations()).then(locations => {
      this.locations = locations;
    })
  }


  ngOnInit() {


    let nfc = new Nfc();
    nfc.available().then(avail => {
      this.avail = avail;
      if (avail) {
        nfc.enabled().then(on => {
          this.enabled = on;

          nfc.setOnNdefDiscoveredListener((data) => {
            const serialHex = this.convertToHex(data.id)
            this.tagId = serialHex;
          })

          nfc.setOnTagDiscoveredListener((data) => {
            const serialHex = this.convertToHex(data.id)
            this.tagId = serialHex;
          })

        })
      }
    })
  }

  private convertToHex(str: number[]) {
    let id: string = '';
    for (var i = 0; i < str.length; i++) {
      id += (i ? ':' : '') + this.decimalHexTwosComplement(str[i]).toUpperCase();
    }
    return id;
  }

  private decimalHexTwosComplement(decimal) {
    const size = 2;

    if (decimal >= 0) {
      let hexadecimal = decimal.toString(16);

      while ((hexadecimal.length % size) != 0) {
        hexadecimal = "" + 0 + hexadecimal;
      }

      return hexadecimal;
    } else {
      let hexadecimal = Math.abs(decimal).toString(16);
      while ((hexadecimal.length % size) != 0) {
        hexadecimal = "" + 0 + hexadecimal;
      }

      var output = '';
      for (let i = 0; i < hexadecimal.length; i++) {
        output += (0x0F - parseInt(hexadecimal[i], 16)).toString(16);
      }

      output = (0x01 + parseInt(output, 16)).toString(16);
      return output;
    }
  }


  setNfcIdForLocation(selectedLocation: LocationModel, tagId: string) {
    firstValueFrom(this._appService.setNfcIdForLocation(selectedLocation.uuid, tagId)).then(() => {

    })
  }
}
