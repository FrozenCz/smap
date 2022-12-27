import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {LocationModel} from './model/location.model';
import {HttpClient} from '@angular/common/http';



@Injectable({
  providedIn:'root'
})
export class AppService {
  rest = 'https://smap-rest.milanknop.cz';

  constructor(private httpClient: HttpClient) {
  }


  getLocations(): Observable<LocationModel[]> {
    return this.httpClient.get<LocationModel[]>(this.rest + '/locations');
  }

  setNfcIdForLocation(locationUuid: string, tagId: string): Observable<void> {
    return this.httpClient.patch<void>(this.rest + '/locations/' + locationUuid, {nfcId: tagId})
  }

}
