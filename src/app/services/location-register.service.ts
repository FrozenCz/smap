import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';

export class LocationNfc {
  locationUuid: string;
  tagId: string
}

@Injectable({
  providedIn: 'root'
})
export class LocationRegisterService {
  private locationNfc$: BehaviorSubject<Map<string, LocationNfc>> = new BehaviorSubject<Map<string, LocationNfc>>(new Map());

  getLocationsForRegister$(): Observable<LocationNfc[]> {
    return this.locationNfc$.asObservable().pipe(map(locMap => Array.from(locMap.values())))
  }

  add(params: LocationNfc): void {
    const {locationUuid} = params;
    const updatedMap = this.locationNfc$.getValue().set(locationUuid, params);
    this.locationNfc$.next(updatedMap);
  }

  remove(locationUuid: string): void {
    const updatedMap = this.locationNfc$.getValue();
    updatedMap.delete(locationUuid);
    this.locationNfc$.next(updatedMap);
  }



}
