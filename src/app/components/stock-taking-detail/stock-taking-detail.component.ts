import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, map, Observable, of, switchMap} from 'rxjs';
import {StockTaking} from '../../model/stock-taking.model';
import {StockTakingService} from '../../services/stock-taking.service';
import {ActivatedRoute} from '@angular/router';
import {LocationModel} from '~/app/model/location.model';
import {AssetModel} from '~/app/model/asset.model';
import {Nfc} from 'nativescript-nfc';
import {AppService} from '~/app/app.service';
import {SnackBar} from '@nativescript-community/ui-material-snackbar';
import {BarcodeScanner} from 'nativescript-barcodescanner';
import {Dialogs} from '@nativescript/core';
import {Utils} from '~/app/utils/utils';


@Component({
  selector: 'ns-stock-taking-detail',
  templateUrl: 'stock-taking-detail.component.html'
})
export class StockTakingDetailComponent implements OnInit {
  stockTaking$: Observable<StockTaking>;
  selectedLocation$: BehaviorSubject<LocationModel | null> = new BehaviorSubject(null);
  avail = false;
  assets$: Observable<AssetModel[]>;

  constructor(
    private stockTakingService: StockTakingService,
    private route: ActivatedRoute,
    private _appService: AppService,
  ) {
    this.stockTaking$ = this.route.paramMap.pipe(
      switchMap((paramMap) => {
        const uuid = paramMap.get('uuid');
        if (uuid) {
          return this.stockTakingService.getOne$(uuid);
        }
      }
    ))
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
    const selectedLocation = this.selectedLocation$.getValue();
    if (selectedLocation) {
      if (serialHex === selectedLocation.nfcId) {
        this.endRoomScanning(selectedLocation);
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
    this.selectedLocation$.next(null);
    const snackBar = new SnackBar();
    snackBar.action({
      message: 'Skenování místostí bylo ukončeno',
      backgroundColor: 'green',
      textColor: 'white',
      hideDelay: 2000
    })
  }

  private startRoomScanning(serialHex: string) {
    this.selectedLocation$.next(this._appService.getLocationByTagId(serialHex));

    this.assets$ = this.selectedLocation$.asObservable().pipe(switchMap(selectedLocation => {
      if (selectedLocation) {
        return Utils.getItemsForRoom({
          assets$: this.stockTaking$.pipe(map((stockTaking) => stockTaking.items)),
          locationUuid: selectedLocation.uuid
        })
      }
      return of([])
    }))

  }

  barcodeScan(param: { stockTakingUuid: string }): void {
    const {stockTakingUuid} = param;
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
        // console.log("Scanner closed")
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
            if (scanned) {
              if (scanned.locationOld && scanned.locationOld.uuid === this.selectedLocation$.getValue().uuid) {
                this.stockTakingService.setFound({stockTakingUuid, scannedId: scanned.id});
              } else {
                this.showBadLocationDecision({stockTakingUuid, scanned});
              }
            }
          }
        }
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      }
    );
  }

  private showBadLocationDecision(param: { scanned: AssetModel, stockTakingUuid: string }) {
    const {scanned, stockTakingUuid} = param;
    let message = 'Majetek nemá přiřazenou místnost, chcete jej přiřadit do této lokace?';
    if (scanned.locationOld) {
      message = 'Majetek ' + scanned.name + ' by se měl nacházet v místnosti ' + scanned.locationOld.name + '. Chcete změnit jeho umístění na ' + this.selectedLocation$.getValue().name + '?';
    }
    setTimeout(() => {
      Dialogs.confirm({
        title: 'Umístění nesouhlasí',
        message,
        okButtonText: 'Ano',
        neutralButtonText: 'Zrušit'
      }).then(result => {
        if (result === true) {
          this.stockTakingService.changeLocation({
            stockTakingUuid,
            scannedId: scanned.id,
            selectedLocation: this.selectedLocation$.getValue()
          });
        }
      })
    },)

  }

}
