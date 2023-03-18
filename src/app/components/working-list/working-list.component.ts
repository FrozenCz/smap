import {Component, OnInit} from '@angular/core';
import {AppService} from '~/app/app.service';
import {Observable, switchMap} from 'rxjs';
import {BarcodeScanner} from 'nativescript-barcodescanner';
import {WorkingList} from '~/app/components/working-lists/working-lists.component';
import {WorkingListService} from '~/app/services/workingList.service';
import {ActivatedRoute} from '@angular/router';
import {Dialogs} from '@nativescript/core';
import {AssetModel} from '~/app/model/asset.model';

@Component({
  selector: 'ns-working-list',
  templateUrl: './working-list.component.html'
})
export class WorkingListComponent implements OnInit {
  workingList$: Observable<WorkingList | undefined>;

  constructor(
    private route: ActivatedRoute,
    private _appService: AppService,
    private workingListService: WorkingListService) {
  }

  ngOnInit() {
    this.workingList$ = this.route.paramMap.pipe(switchMap(paramMap => {
      const id = +paramMap.get('id')
      if (!id) {
        throw new Error('id not provided!');
      }
      return this.workingListService.getOne$(id);
    }))
  }


  barcodeScan(workingList: WorkingList): void {
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
            if (scanned && scanned.id) {
              this.workingListService.addItem({
                workingList: workingList,
                item: scanned
              })
            }
          }
        }
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      }
    );
  }

  showDeleteConfirm(workingList: WorkingList, item: AssetModel): void {
    Dialogs.confirm({
      title: 'Smazání věci ze sestavy',
      message: 'Opravdu chcete smazat věc ' + item.name + ' ze sestavy?',
      neutralButtonText: 'Zrušit',
      okButtonText: 'Smazat',
    }).then((result) => {
      if (result) {
        this.workingListService.removeItem({
          workingList,
          item
        });
      }
    })
  }

}
