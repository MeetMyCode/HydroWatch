import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
//import { getHostNameToUse, getLocalNetworkIpToUse, getPiIpToUse, getPortToUse, getWebSocketPortToUse } from './models/networkSettings';
const netSettings = require('./models/networkSettings.js');

import { User } from '../app/models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    //private webServerHostName = 'localhost';
    //private webServerPort = 8080;
    //private sslPort = 443;

    constructor(private https: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string): Observable<String> {

        var hostname = netSettings.getHostNameToUse();
        var port = netSettings.getPortToUse();

        var loginData = {'uname':username, 'password':password};
        var url = `https://${hostname}:${port}/login`;

        console.log(`loginData is: ${JSON.stringify(loginData)}`);
        console.log(`About to make login POST request to ${url}...`);
        //const headers = {'Content-Type':'application/json; charset=utf-8','responseType':'text'};
        //var httpHeaders = new HttpHeaders(headers);
        return this.https.post<any>(url, JSON.stringify(loginData));

    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}