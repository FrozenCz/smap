import {NgModule} from '@angular/core'
import {Routes} from '@angular/router'
import {NativeScriptRouterModule} from '@nativescript/angular'

import {ItemsComponent} from './item/items.component'
import {ItemDetailComponent} from './item/item-detail.component'
import {MainPageComponent} from '~/app/components/main-page/main-page.component';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';
import {LocationRegisterComponent} from '~/app/components/location-register/location-register.component';

const routes: Routes = [
  {path: '', redirectTo: '/main-page', pathMatch: 'full'},
  {path: 'main-page', component: MainPageComponent},
  {path: 'asset-scan', component: AssetScanComponent},
  {path: 'location-register', component: LocationRegisterComponent},
  {path: 'items', component: ItemsComponent},
  {path: 'item/:id', component: ItemDetailComponent},
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {
}
