import {Component, OnInit} from '@angular/core';
import {LocationModel} from '~/app/model/location.model';
import {Nfc} from 'nativescript-nfc';
import {AppService} from '~/app/app.service';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {AssetModel} from '~/app/model/asset.model';

@Component({
  selector: 'ns-asset-scan',
  templateUrl: './asset-scan.component.html'
})
export class AssetScanComponent implements OnInit {
  selectedLocation: LocationModel | null = null;
  avail = false;
  assets: AssetModel[] = [];

  constructor(private _appService: AppService) {

  }


  ngOnInit() {
    let nfc = new Nfc();
    nfc.available().then(avail => {
      this.avail = avail;
      if (avail) {
        nfc.enabled().then(on => {
          nfc.setOnNdefDiscoveredListener((data) => {
            this.setSelectedLocation(data.id);
          })

          nfc.setOnTagDiscoveredListener((data) => {
            this.setSelectedLocation(data.id);
          })
        })
      }
    })

  }

  private setSelectedLocation(arrNum: number[]) {
    const serialHex = AppService.convertToHex(arrNum);
    if (this.selectedLocation) {
      if (serialHex === this.selectedLocation.nfcId) {
        this.endRoomScanning(this.selectedLocation);
      } else {
        this.showBadTagScanAlert();
      }
    } else {
      this.startRoomScanning(serialHex);
    }
  }

  private showBadTagScanAlert() {
    const snackBar = new SnackBar();
    snackBar.action({
      message: 'Špatný NFC štítek, ukončete příložením ke štítku, kterým bylo skenování započato',
      backgroundColor: 'red',
      textColor: 'white',
      hideDelay: 10000
    })
  }

  private endRoomScanning(selectedLocation: LocationModel) {
    this.selectedLocation = null;
    const snackBar = new SnackBar();
    snackBar.action({
      message: 'Skenování místostí bylo ukončeno',
      backgroundColor: 'green',
      textColor: 'white',
      hideDelay: 2000
    })
  }

  private startRoomScanning(serialHex: string) {
    this.selectedLocation = this._appService.getLocationByTagId(serialHex);
    this.assets = this._appService.getItemsForRoom(this.selectedLocation.uuid);
  }
}
