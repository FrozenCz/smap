import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, ReplaySubject, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {restUrl} from '../config';
import jwt_decode from 'jwt-decode';
import * as sha from 'js-sha1';
import {ApplicationSettings} from '@nativescript/core';

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
  token$: BehaviorSubject<{ accessToken: string, jwtToken: JwtToken } | null> =
    new BehaviorSubject<{ accessToken: string, jwtToken: JwtToken } | null>(null);

  constructor(private httpClient: HttpClient) {
  }

  accessToken$(): Observable<string | null> {
    return this.token$.asObservable().pipe(map(obj => obj?.accessToken ?? null))
  }

  user$(): Observable<JwtToken | null> {
    return this.token$.asObservable().pipe(map(obj => obj?.jwtToken ?? null));
  }

  private saveTokenLocally(param: {
    username: string;
    password: string;
    accessToken: string;
    jwtToken: JwtToken;
  }): void {
    const {username, jwtToken, password, accessToken} = param;

    const sh = sha.create();
    sh.update(password);
    const hashed = sh.hex();

    ApplicationSettings.setString('token_' + username, JSON.stringify({
      accessToken,
      jwtToken: jwtToken,
      password: hashed
    }))
  }

  login(name: string, password: string): Observable<void> {
    return this.httpClient.post<{ accessToken: string }>(restUrl + '/auth/sign_in', {username: name, password}).pipe(
      map((token) => {
        if (token.accessToken) {
          const jwtToken: JwtToken = jwt_decode(token.accessToken)
          this.saveTokenLocally({
            username: name, jwtToken, accessToken: token.accessToken, password
          })
          this.token$.next({accessToken: token.accessToken, jwtToken});
        } else {
          this.token$.next(null);
        }
        return;
      }),
      catchError(error => {
        const fromLocal = ApplicationSettings.getString('token_' + name)
        if (fromLocal) {
          const parsed = JSON.parse(fromLocal);
          if (parsed) {
            const sh = sha.create();
            sh.update(password);
            const hashed = sh.hex();
            if (parsed.password === hashed) {
              this.token$.next({accessToken: parsed.accessToken, jwtToken: parsed.jwtToken});
              return of([]).pipe(map(() => {
              }));
            }
          }
        }
        throw 'Bad login'
      })
    )
  }

  logOut() {
    this.token$.next(null);
  }
}
