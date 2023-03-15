import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {StockTaking} from '../model/stock-taking.model';
import {LocationModel} from '~/app/model/location.model';


@Injectable({
  providedIn: 'root'
})
export class StockTakingService {
  private _stockTakings$: BehaviorSubject<StockTaking[]> = new BehaviorSubject([]);


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
      throw new Error('item is not yours!')
    }
    return found;
  }

  public put(stockTakings: StockTaking[]): void {
    this._stockTakings$.next(stockTakings);
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
    this._stockTakings$.next(stockTakings);

  }


}
