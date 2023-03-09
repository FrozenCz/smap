import {Component, OnInit} from '@angular/core';
import {LocationModel} from '~/app/model/location.model';
import {Nfc} from 'nativescript-nfc';
import {AppService} from '~/app/app.service';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {AssetModel} from '~/app/model/asset.model';
import {BarcodeScanner} from "nativescript-barcodescanner";
import {Observable, startWith} from 'rxjs';
import {Dialogs} from '@nativescript/core';


@Component({
  selector: 'ns-asset-scan',
  templateUrl: './asset-scan.component.html'
})
export class AssetScanComponent implements OnInit {
  selectedLocation: LocationModel | null = null;
  avail = false;
  assets$: Observable<AssetModel[]>;

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
    if (this.selectedLocation) {
      this.assets$ = this._appService.getItemsForRoom(this.selectedLocation.uuid).pipe(startWith([]));
    }
  }

  barcodeTest(): void {
    new BarcodeScanner().scan({
      formats: "QR_CODE, EAN_13",
      cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
      cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
      message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
      showFlipCameraButton: true,   // default false
      preferFrontCamera: false,     // default false
      showTorchButton: true,        // default false
      beepOnScan: true,             // Play or Suppress beep on scan (default true)
      fullScreen: true,             // Currently only used on iOS; with iOS 13 modals are no longer shown fullScreen by default, which may be actually preferred. But to use the old fullScreen appearance, set this to 'true'. Default 'false'.
      torchOn: false,               // launch with the flashlight on (default false)
      closeCallback: () => {
        console.log("Scanner closed")
      }, // invoked when the scanner was closed (success or abort)
      resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
      openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
      presentInRootViewController: true // iOS-only; If you're sure you're not presenting the (non embedded) scanner in a modal, or are experiencing issues with fi. the navigationbar, set this to 'true' and see if it works better for your app (default false).
    }).then((result) => {
        if (result.text) {
          const scannedObj = JSON.parse(result.text);
          console.log(scannedObj);
          // if (scannedObj.id) {
          //   const scanned = this._appService.getItemById(scannedObj.id);
          //   if (scanned) {
          //     if (scanned.locationOld && scanned.locationOld.uuid === this.selectedLocation.uuid) {
          //       this._appService.setFound(scanned.id);
          //     } else {
          //       this.showBadLocationDecision(scanned);
          //     }
          //   }
          // }
        }
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      }
    );
  }

  private showBadLocationDecision(scanned: AssetModel) {
    let message = 'Majetek nemá přiřazenou místnost, chcete jej přiřadit do této lokace?';
    if (scanned.locationOld) {
      message = 'Majetek ' + scanned.name + ' by se měl nacházet v místnosti ' + scanned.locationOld.name + '. Chcete změnit jeho umístění na ' + this.selectedLocation.name + '?';
    }
    setTimeout(() => {
      Dialogs.confirm({
        title: 'Umístění nesouhlasí',
        message,
        okButtonText: 'Ano',
        neutralButtonText: 'Zrušit'
      }).then(result => {
        if (result === true) {
          this._appService.changeLocation(scanned.id, this.selectedLocation.uuid);
        }
      })
    }, )

  }
}
