import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, ReplaySubject, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {restUrl} from '../config';
import jwt_decode from 'jwt-decode';
import {AppService} from '~/app/app.service';

export interface JwtToken {
  userId: number;
  username: string;
  rights: string[];
  unitId: number | null;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token$: BehaviorSubject<{ accessToken: string, jwtToken: JwtToken } | null> = new BehaviorSubject<{ accessToken: string, jwtToken: JwtToken } | null>(null);

  constructor(private httpClient: HttpClient) {
  }

  accessToken$(): Observable<string | null> {
    return this.token$.asObservable().pipe(map(obj => obj?.accessToken ?? null))
  }

  user$(): Observable<JwtToken | null> {
    return this.token$.asObservable().pipe(map(obj => obj?.jwtToken ?? null));
  }

  login(name: string, password: string): Observable<void> {
    return this.httpClient.post<{ accessToken: string }>(restUrl + '/auth/sign_in', {username: name, password}).pipe(
      map((token) => {
        if (token.accessToken) {
          const jwtToken: JwtToken = jwt_decode(token.accessToken)
          this.token$.next({accessToken: token.accessToken, jwtToken});
        } else {
          this.token$.next(null);
        }
        return;
      })
    )
  }

  logOut() {
    this.token$.next(null);
  }
}
