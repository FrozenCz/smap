import {NgModule} from '@angular/core'
import {Routes} from '@angular/router'
import {NativeScriptRouterModule} from '@nativescript/angular'

import {MainPageComponent} from '~/app/components/main-page/main-page.component';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';
import {LocationRegisterComponent} from '~/app/components/location-register/location-register.component';
import {ResultsComponent} from '~/app/components/results/results.component';

const routes: Routes = [
  {path: '', redirectTo: '/main-page', pathMatch: 'full'},
  {path: 'main-page', component: MainPageComponent},
  {path: 'asset-scan', component: AssetScanComponent},
  {path: 'location-register', component: LocationRegisterComponent},
  {path: 'results', component: ResultsComponent},
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {
}
