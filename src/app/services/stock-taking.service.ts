import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {StockTaking} from '../model/stock-taking.model';
import {LocationModel} from '~/app/model/location.model';
import {ApplicationSettings} from '@nativescript/core';



@Injectable({
  providedIn: 'root'
})
export class StockTakingService {
  private _stockTakings$: BehaviorSubject<StockTaking[]> = new BehaviorSubject([]);

  constructor() {
    this._stockTakings$.next(this.loadLocallyStockTaking())
  }

  private saveLocallyStockTakings(stockTaking: StockTaking[]) {
    ApplicationSettings.setString('stockTakings', JSON.stringify(stockTaking))
  }

  private loadLocallyStockTaking(): StockTaking[] {
    const stockTaking = ApplicationSettings.getString('stockTakings')
    if (stockTaking) {
      return JSON.parse(stockTaking);
    }
    return []
  }

  private static getPointerStockTaking(stockTakings: StockTaking[], stockTakingUuid: string) {
    const found = stockTakings.find(stockTaking => stockTaking.uuid === stockTakingUuid);
    if (!found) {
      throw new Error('stock taking not found')
    }
    return found;
  }

  private static getPointerStockTakingItem(pointerStockTaking: StockTaking, scannedId: number) {
    const found = pointerStockTaking.items.find(item => item.id === scannedId);
    if (!found) {
      //possible upgrade: confirm to add list to transfer?
      throw new Error('item is not yours!')
    }
    return found;
  }

  public putFetched(stockTakings: StockTaking[]): void {
    const alreadyIn = this._stockTakings$.getValue();
    const alreadyInUuids = alreadyIn.map(st => st.uuid);
    const onlyNew = stockTakings.filter(st => !alreadyInUuids.includes(st.uuid))
    this.changeState([...alreadyIn, ...onlyNew]);
  }

  public getAll$(): Observable<StockTaking[]> {
    return this._stockTakings$.asObservable();
  }

  public getOne$(uuid: string): Observable<StockTaking> {
    return this.getAll$().pipe(map(stockTakings => {
      const found = stockTakings.find(stockTaking => stockTaking.uuid === uuid);
      if (!found) {
        throw new Error('Uuid not found');
      }
      return found;
    }))
  }

  setFound(param: { stockTakingUuid: string; scannedId: number }) {
    const {stockTakingUuid, scannedId} = param;
    const stockTakings = this._stockTakings$.getValue();
    const pointerStockTaking = StockTakingService.getPointerStockTaking(stockTakings, stockTakingUuid);
    const pointerStockTakingItem = StockTakingService.getPointerStockTakingItem(pointerStockTaking, scannedId);

    pointerStockTakingItem.foundAt = new Date();
    pointerStockTakingItem.found = true;

    this.changeState(stockTakings);
  }

  private changeState(stockTakings: StockTaking[]): void {
    this.saveLocallyStockTakings(stockTakings);
    this._stockTakings$.next(stockTakings);
  }

  changeLocation(param: { stockTakingUuid: string; selectedLocation: LocationModel; scannedId: number }) {
    const {stockTakingUuid, selectedLocation, scannedId} = param;
    const stockTakings = this._stockTakings$.getValue();
    const pointerStockTaking = StockTakingService.getPointerStockTaking(stockTakings, stockTakingUuid);
    const pointerStockTakingItem = StockTakingService.getPointerStockTakingItem(pointerStockTaking, scannedId);

    pointerStockTakingItem.foundAt = new Date();
    pointerStockTakingItem.found = true;
    pointerStockTakingItem.locationConfirmed = selectedLocation
    this.changeState(stockTakings);


  }


}
