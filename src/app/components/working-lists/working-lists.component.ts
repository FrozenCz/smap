import {Component, OnInit} from '@angular/core';
import {Dialogs} from '@nativescript/core';
import {WorkingListService} from '~/app/services/workingList.service';
import {Observable} from 'rxjs';
import {AssetModel} from '~/app/model/asset.model';


export interface WorkingList {
  id: number;
  name: string;
  items: AssetModel[];
}

@Component({
  selector: 'ns-working-lists',
  templateUrl: './working-lists.component.html'
})
export class WorkingListsComponent implements OnInit {
  workingLists$: Observable<WorkingList[]>;


  constructor(private _workingListService: WorkingListService) {
    this.workingLists$ = this._workingListService.getAll$();
  }

  ngOnInit(): void {
  }

  showCreateNewDialog() {
    Dialogs.prompt({
      message: 'Zadejte prosím název nové sestavy',
      title: 'Tvorba nové sestavy',
      okButtonText: 'Vytvořit',
      neutralButtonText: 'Zrušit'
    }).then((result) => {
      if (result.result) {
        const id = this.getId();
        this._workingListService.add({
          id,
          name: result.text.length === 0 ? 'nezadano_' + id : result.text,
          items: []
        })
      }
    })
  }

  private getId() {
    return new Date().getTime();
  }

  showDeleteConfirm(item: WorkingList): void {
    Dialogs.confirm({
      title: 'Smazání sestavy',
      message: 'Opravdu chcete smazat sestavu ' + item.name + '?',
      neutralButtonText: 'Zrušit',
      okButtonText: 'Smazat',
    }).then((result) => {
      if (result) {
        this._workingListService.remove(item);
      }
    })
  }
}
