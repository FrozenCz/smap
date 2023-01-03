import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, firstValueFrom, map, noop, Observable, tap} from 'rxjs';
import {LocationModel} from './model/location.model';
import {HttpClient} from '@angular/common/http';
import {AssetModel, AssetModelDTO} from '~/app/model/asset.model';


@Injectable({
  providedIn: 'root'
})
export class AppService {
  _locations$: BehaviorSubject<LocationModel[]> = new BehaviorSubject<LocationModel[]>([]);
  _items$: BehaviorSubject<AssetModel[]> = new BehaviorSubject<AssetModel[]>([]);
  rest = 'https://smap-rest.milanknop.cz';

  constructor(private httpClient: HttpClient) {
    firstValueFrom(this.reloadData()).then(noop)
  }

  private fetchLocations(): Observable<LocationModel[]> {
    return this.httpClient.get<LocationModel[]>(this.rest + '/locations').pipe(
      tap((locations) => this._locations$.next(locations)))
  }

  private fetchItems(): Observable<AssetModelDTO[]> {
    return this.httpClient.get<AssetModelDTO[]>(this.rest + '/barcodes').pipe(tap((assetModelDTOs) => {
      this._items$.next(assetModelDTOs.map(a => {
        return {
          id: a.id,
          name: a.name,
          found: false,
          locationOld: a.Location,
          locationConfirmed: undefined
        }
      }))
    }))
  }


  getLocations$(): Observable<LocationModel[]> {
    return this._locations$.asObservable();
  }

  getLocationByTagId(tagId: string): LocationModel | undefined {
    return this._locations$.getValue().find(l => l.nfcId === tagId);
  }

  setNfcIdForLocation(locationUuid: string, tagId: string): Observable<void> {
    return this.httpClient.patch<void>(this.rest + '/locations/' + locationUuid, {nfcId: tagId})
  }

  static convertToHex(str: number[]): string {
    let id: string = '';
    for (var i = 0; i < str.length; i++) {
      id += (i ? ':' : '') + AppService.decimalHexTwosComplement(str[i]).toUpperCase();
    }
    return id;
  }

  private static decimalHexTwosComplement(decimal): string {
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

  getItemsForRoom(uuid: string): Observable<AssetModel[]> {
    return this._items$.asObservable().pipe(map(assets => assets.filter(i => (i.locationOld && i.locationOld.uuid === uuid && i.locationConfirmed === undefined) || i.locationConfirmed?.uuid === uuid)))
  }

  getItemById(id: number): AssetModel | undefined {
    return this._items$.getValue().find(a => a.id === id);
  }


  setFound(id: number) {
    const withFound = this._items$.getValue();
    withFound.find(i => i.id === id).found = true;
    this._items$.next(withFound);
  }

  changeLocation(id: number, uuid: string) {
    const withFound = this._items$.getValue();
    const change = withFound.find(i => i.id === id);
    change.found = true;
    change.locationConfirmed = this._locations$.getValue().find(l => l.uuid === uuid);
    this._items$.next(withFound);
  }

  reloadData() {
    return combineLatest([this.fetchLocations(), this.fetchItems()])
  }

  sendData() {
    return this.httpClient.post<void>(this.rest + '/barcodes/changes', {
      assets: this._items$.getValue().map(a => {
        return {
          id: a.id,
          found: a.found,
          locationConfirmedUuid: a.locationConfirmed?.uuid
        }
      })
    })
  }

  getItems() {
    return this._items$.asObservable();
  }
}
