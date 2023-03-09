import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core'
import {NativeScriptFormsModule, NativeScriptHttpClientModule, NativeScriptModule} from '@nativescript/angular'

import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {MainPageComponent} from '~/app/components/main-page/main-page.component';
import {AssetScanComponent} from '~/app/components/asset-scan/asset-scan.component';
import {LocationRegisterComponent} from '~/app/components/location-register/location-register.component';
import {ResultsComponent} from '~/app/components/results/results.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from '~/app/services/auth.interceptor';
import {WorkingListComponent} from '~/app/components/working-list/working-list.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NativeScriptHttpClientModule, NativeScriptFormsModule],
  declarations: [AppComponent, MainPageComponent, ResultsComponent,
    AssetScanComponent,
    LocationRegisterComponent,
    WorkingListComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {
}
