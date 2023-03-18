import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  noop,
  Observable,
  switchMap,
  take,
  tap
} from 'rxjs';
import {LocationModel} from './model/location.model';
import {HttpClient} from '@angular/common/http';
import {AssetModel, AssetModelDTO} from '~/app/model/asset.model';
import {restUrl} from '~/app/config';
import {WorkingList} from '~/app/components/working-lists/working-lists.component';
import {StockTaking, StockTakingDTO, StockTakingDTOPatch} from '~/app/model/stock-taking.model';
import {StockTakingService} from '~/app/services/stock-taking.service';
import {Transform} from '~/app/utils/transform';
import {AuthService} from '~/app/services/auth.service';
import {ApplicationSettings} from '@nativescript/core';


@Injectable({
  providedIn: 'root'
})
export class AppService {
  private _locations$: BehaviorSubject<LocationModel[]> = new BehaviorSubject<LocationModel[]>([]);
  private _items$: BehaviorSubject<AssetModel[]> = new BehaviorSubject<AssetModel[]>([]);

  constructor(private httpClient: HttpClient, private stockTakingService: StockTakingService, private authService: AuthService) {

    this._locations$.next(this.loadLocallyLocations())
    this._items$.next(this.loadLocallyItems())

    this.authService.token$.asObservable().subscribe((token) => {
      if (token && token.accessToken) {
        this.reloadData().pipe(take(1)).toPromise().then(noop)
      }
    })
  }

  private static transformStockPatch(stockTakingPatch: StockTaking[]): StockTakingDTOPatch {
    return {stockTakings: stockTakingPatch.map(stockTaking => {
      return {
        uuid: stockTaking.uuid,
        items: stockTaking.items.map(item => {
          return {
            uuid: item.uuid,
            foundAt: item.foundAt,
            locationUuid: item.locationConfirmed ? item.locationConfirmed.uuid : null
          }
        })
      }
      })}
  }

  private fetchStockTakings(): Observable<StockTakingDTO[]> {
    return this.httpClient.get<StockTakingDTO[]>(restUrl + '/assets/stock-taking-in-progress').pipe(
      tap(stockTakings => this.stockTakingService.putFetched(stockTakings.map(stockTaking => Transform.stockTakingDTO(stockTaking))))
    )
  }

  private fetchLocations(): Observable<LocationModel[]> {
    return this.httpClient.get<LocationModel[]>(restUrl + '/locations').pipe(
      tap((locations) => this.putFetchedLocations(locations)))
  }

  private putFetchedItems(items: AssetModel[]): void {
    const alreadyIn = this._items$.getValue();
    const alreadyInUuids = alreadyIn.map(st => st.id);
    const onlyNew = items.filter(st => !alreadyInUuids.includes(st.id))
    this.changeStateItems([...alreadyIn, ...onlyNew])
  }

  private changeStateLocations(locations: LocationModel[]): void {
    this.saveLocallyLocations(locations);
    this._locations$.next(locations);
  }

  private changeStateItems(items: AssetModel[]): void {
    this.saveLocallyItems(items);
    this._items$.next(items);
  }

  private putFetchedLocations(locations: LocationModel[]): void {
    const alreadyIn = this._locations$.getValue();
    const alreadyInUuids = alreadyIn.map(st => st.uuid);
    const onlyNew = locations.filter(st => !alreadyInUuids.includes(st.uuid))
    this.changeStateLocations([...alreadyIn, ...onlyNew])
  }

  private saveLocallyItems(items: AssetModel[]) {
    ApplicationSettings.setString('items', JSON.stringify(items))
  }

  private loadLocallyItems(): AssetModel[] {
    const items = ApplicationSettings.getString('items')
    if (items) {
      return JSON.parse(items);
    }
    return []
  }

  private saveLocallyLocations(locations: LocationModel[]) {
    ApplicationSettings.setString('locations', JSON.stringify(locations))
  }

  private loadLocallyLocations(): LocationModel[] {
    const locations = ApplicationSettings.getString('locations')
    if (locations) {
      return JSON.parse(locations);
    }
    return []
  }

  private fetchItems(): Observable<AssetModelDTO[]> {
    return this.httpClient.get<AssetModelDTO[]>(restUrl + '/assets/barcodes').pipe(tap((assetModelDTOs) => {
      this.putFetchedItems(assetModelDTOs.map(a => {
        return {
          id: a.id,
          name: a.name + ', sn:' + a.serialNumber,
          found: false,
          foundAt: null,
          locationOld: a.location,
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
    return this.httpClient.patch<void>(restUrl + '/locations/' + locationUuid + '/nfc', {nfcId: tagId})
  }

  saveWorkingList(workingList: WorkingList): Observable<void> {
    return this.httpClient.post<void>(restUrl + '/lists/', {
      name: workingList.name,
      assetsIds: workingList.items.map(item => item.id),
      connected: false,
      archived: false
    })
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
    this.changeStateItems(withFound);
  }

  changeLocation(id: number, uuid: string) {
    const withFound = this._items$.getValue();
    const change = withFound.find(i => i.id === id);
    change.found = true;
    change.locationConfirmed = this._locations$.getValue().find(l => l.uuid === uuid);
    this.changeStateItems(withFound);
  }

  reloadData() {
    return combineLatest([this.fetchLocations(), this.fetchItems(), this.fetchStockTakings()])
  }

  sendItemsLocation() {
    return this.httpClient.post<void>(restUrl + '/barcodes/changes', {
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

  sendStockTakings(): Observable<void> {

    return this.stockTakingService.getAll$()
      .pipe(
        switchMap(
          (stockTakings) => {
            const stockTakingDTOPatch: StockTakingDTOPatch = AppService.transformStockPatch(stockTakings);
           return  this.httpClient.patch<void>(restUrl + '/assets/stock-taking-in-progress', {stockTakings: stockTakingDTOPatch.stockTakings})
          }
        )
      )
  }
}
