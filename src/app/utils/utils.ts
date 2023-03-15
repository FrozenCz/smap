import {map, Observable, startWith} from 'rxjs';
import {AssetModel} from '../model/asset.model';

export abstract class Utils {

  private constructor() {
  }

  public static getItemsForRoom(param: {locationUuid: string; assets$: Observable<AssetModel[]>}): Observable<AssetModel[]> {
    const {locationUuid, assets$} = param;
    return assets$
      .pipe(
        map(assets => assets.filter(i => (i.locationOld && i.locationOld.uuid === locationUuid && i.locationConfirmed === undefined) || i.locationConfirmed?.uuid === locationUuid)))
      .pipe(startWith([]))
  }

}
