import {Component, OnInit} from '@angular/core';
import {AppService} from '../../app.service';
import {Dialogs} from '@nativescript/core';



export interface WorkingList {
  id: number;
  name: string;
  items: [];
}

@Component({
  selector: 'ns-working-lists',
  templateUrl: './working-lists.component.html'
})
export class WorkingListsComponent implements OnInit {
  workingLists: WorkingList[] = [];

  constructor(private _appService: AppService) {

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
      if (result) {
        this.workingLists.push({
          id: this.getId(),
          name: result.text,
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
      neutralButtonText: 'Zrušit',
      okButtonText: 'Smazat',
    }).then((result) => {
      if (result) {
        this.workingLists = this.workingLists.filter(workingList => workingList.id !== item.id)
      }
    })
  }
}
