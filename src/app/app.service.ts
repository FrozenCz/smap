import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, firstValueFrom, noop, Observable, switchMap, take, tap} from 'rxjs';
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
    this.fetchLocations();
    this.fetchItems();
  }

  private fetchLocations(): void {
    firstValueFrom(this.httpClient.get<LocationModel[]>(this.rest + '/locations').pipe(
      tap((locations) => this._locations$.next(locations)))).then(noop)
  }

  private fetchItems(): void {
      firstValueFrom(this.httpClient.get<AssetModelDTO[]>(this.rest + '/barcodes')).then((assetModelDTOs) => {
      this._items$.next(assetModelDTOs.map(a => {
        return {
          id: a.id,
          name: a.name,
          found: false,
          locationOld: a.Location,
          locationConfirmed: undefined
        }
      }))
    })
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

  getItemsForRoom(uuid: string): AssetModel[] {
    return this._items$.getValue().filter(i => i.locationOld.uuid === uuid);
  }
}
