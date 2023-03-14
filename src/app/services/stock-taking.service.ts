import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {StockTaking} from '../model/stock-taking.model';


@Injectable({
  providedIn: 'root'
})
export class StockTakingService {
  private _stockTakings$: BehaviorSubject<StockTaking[]> = new BehaviorSubject([]);

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

}
