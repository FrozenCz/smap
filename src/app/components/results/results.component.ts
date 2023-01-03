import {Component, OnInit} from '@angular/core';
import {AppService} from '../../app.service';
import {Observable} from 'rxjs';
import {AssetModel} from '~/app/model/asset.model';


@Component({
  selector: 'ns-results',
  templateUrl: './results.component.html',
  styles: ['Button{font-size:30}']
})
export class ResultsComponent implements OnInit {
  assets$: Observable<AssetModel[]>;

  constructor(private _appService: AppService) {
    this.assets$ = this._appService.getItems();
  }

  ngOnInit(): void {
  }

}
