import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {StockTaking} from '~/app/model/stock-taking.model';
import {StockTakingService} from '~/app/services/stock-taking.service';


@Component({
  selector: 'ns-stock-takings',
  templateUrl: 'stock-takings.component.html'
})
export class StockTakingsComponent {
  stockTakings$: Observable<StockTaking[]>;

  constructor(private stockTakingService: StockTakingService) {
    this.stockTakings$ = this.stockTakingService.getAll$();
  }

}
