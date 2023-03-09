import {Component, OnInit} from '@angular/core';
import {AppService} from '~/app/app.service';
import {Observable} from 'rxjs';
import {AssetModel} from '~/app/model/asset.model';
import {Nfc} from 'nativescript-nfc';
import {BarcodeScanner} from 'nativescript-barcodescanner';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';

@Component({
  selector: 'ns-working-list',
  templateUrl: './working-list.component.html'
})
export class WorkingListComponent implements OnInit {
  workingListName: string = '';
  scannedItems: AssetModel[] = [];
  avail = false;
  assets$: Observable<AssetModel[]>;

  constructor(private _appService: AppService) {

  }

  ngOnInit() {


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
          if (scannedObj.id) {
            const scanned = this._appService.getItemById(scannedObj.id);
            if (scanned && scanned.id && !this.scannedItems.some(i => i.id === scanned.id)) {
              this.scannedItems.push(scanned);
            }
          }
        }
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      }
    );
  }
}
