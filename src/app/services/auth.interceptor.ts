import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, switchMap} from 'rxjs';
import {AuthService} from './auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.accessToken$().pipe(
      switchMap(accessToken => {
        if (accessToken) {
          const cloned = req.clone({
            headers: req.headers
              .set('Authorization', `Bearer ${accessToken}`)
          });
          return next.handle(cloned);
        } else {
          return next.handle(req);
        }
      })
    )
  }
}
