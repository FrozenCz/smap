import {Component, OnInit} from '@angular/core';
import {Nfc} from 'nativescript-nfc';
import {Observable, combineLatest, map} from 'rxjs';
import {AppService} from '~/app/app.service';
import {LocationModel} from '~/app/model/location.model';
import {LocationRegisterService} from '~/app/services/location-register.service';
import {Dialogs} from '@nativescript/core';


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
  locationForRegister$: Observable<LocationModel[]>;


  constructor(private _appService: AppService, private locationRegisterService: LocationRegisterService) {
    this.locations$ = this._appService.getLocations$();
    this.locationForRegister$ =
      combineLatest([
        this.locations$,
        this.locationRegisterService.getLocationsForRegister$()
      ]).pipe(map(([locations, forRegister]) => {
        return forRegister.map(registeringLocation => {
          return locations.find(location => location.uuid === registeringLocation.locationUuid)
        })
      }))
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
            this.tagId = serialHex;
          })

          nfc.setOnTagDiscoveredListener((data) => {
            const serialHex = AppService.convertToHex(data.id)
            this.tagId = serialHex;
          })

        })
      }
    })
  }

  addNfcForRegister(selectedLocation: LocationModel, tagId: string) {
    this.locationRegisterService.add({locationUuid: selectedLocation.uuid, tagId: tagId})
    this.tagId = null;
    this.selectedLocation = null;
  }

  onRemoveNfc(uuid: any) {

    Dialogs.confirm({title: 'Smazat?', message: 'Opravdu?', neutralButtonText: 'Zrušit', okButtonText: 'Smazat'})
      .then((result) => {
        if (result) {
          this.locationRegisterService.remove(uuid);
        }
      })


  }
}
