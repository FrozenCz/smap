import {Injectable} from '@angular/core';
import {WorkingList} from '~/app/components/working-lists/working-lists.component';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {AssetModel} from '~/app/model/asset.model';


@Injectable({
  providedIn: 'root'
})
export class WorkingListService {

  private _workingLists$: BehaviorSubject<WorkingList[]> = new BehaviorSubject<WorkingList[]>([]);

  public add(wl: WorkingList): void {
    this._workingLists$.next([...this._workingLists$.getValue(), wl])
  }

  public remove(wl: WorkingList) {
    this._workingLists$.next(this._workingLists$.getValue().filter(wl => wl.id !== wl.id))
  }

  public getAll$(): Observable<WorkingList[]> {
    return this._workingLists$.asObservable();
  }

  public getOne$(id: number): Observable<WorkingList | undefined> {
    return this.getAll$().pipe(map(wls => wls.find(wl => wl.id === id)))
  }

  public addItem(params: { workingList: WorkingList, item: AssetModel }): void {
    const {workingList, item} = params;
    const workingListOrigin = this._workingLists$.getValue();

    const pointer = this.getPointerWorkingList({
      workingListOrigin, workingList
    });
    pointer.items = pointer.items.filter(i => i.id !== item.id);
    pointer.items.push(item);

    this._workingLists$.next(workingListOrigin);
  }

  private getPointerWorkingList(param: {
    workingListOrigin: WorkingList[], workingList: WorkingList
  }) {
    const {workingList, workingListOrigin} = param;
    const index = workingListOrigin.indexOf(workingList);
    if (index === -1) {
      throw new Error('Index not found');
    }
    return workingListOrigin[index];
  }

  removeItem(param: { item: AssetModel; workingList: WorkingList }) {
    const {workingList, item} = param;
    const workingListOrigin = this._workingLists$.getValue();
    const pointer = this.getPointerWorkingList({workingListOrigin, workingList});
    pointer.items = pointer.items.filter(pointerItem => pointerItem.id !== item.id)
    this._workingLists$.next(workingListOrigin)
  }
}
