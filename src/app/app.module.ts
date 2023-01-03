import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core'
import {NativeScriptHttpClientModule, NativeScriptModule} from '@nativescript/angular'

import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {MainPageComponent} from '~/app/components/main-page/main-page.component';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';
import {LocationRegisterComponent} from '~/app/components/location-register/location-register.component';
import {ResultsComponent} from '~/app/components/results/results.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NativeScriptHttpClientModule],
  declarations: [AppComponent, MainPageComponent, ResultsComponent,
    AssetScanComponent,
    LocationRegisterComponent
  ],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {
}
