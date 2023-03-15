import {NgModule} from '@angular/core'
import {Routes} from '@angular/router'
import {NativeScriptRouterModule} from '@nativescript/angular'

import {MainPageComponent} from '~/app/components/main-page/main-page.component';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';
import {LocationRegisterComponent} from '~/app/components/location-register/location-register.component';
import {ResultsComponent} from '~/app/components/results/results.component';
import {WorkingListsComponent} from '~/app/components/working-lists/working-lists.component';
import {WorkingListComponent} from '~/app/components/working-list/working-list.component';
import {SendDataComponent} from '~/app/components/send-data/send-data.component';
import {StockTakingsComponent} from '~/app/components/stock-takings/stock-takings.component';
import {StockTakingDetailComponent} from '~/app/components/stock-taking-detail/stock-taking-detail.component';

const routes: Routes = [
  {path: '', redirectTo: '/main-page', pathMatch: 'full'},
  {path: 'main-page', component: MainPageComponent},
  {path: 'send-data', component: SendDataComponent},
  {path: 'asset-scan', component: AssetScanComponent},
  {path: 'working-lists', component: WorkingListsComponent},
  {path: 'working-lists/:id', component: WorkingListComponent},
  {path: 'location-register', component: LocationRegisterComponent},
  {path: 'results', component: ResultsComponent},
  {path: 'stock-takings', component: StockTakingsComponent},
  {path: 'stock-takings/:uuid', component: StockTakingDetailComponent},
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {
}
