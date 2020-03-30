import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
const netSettings = require('../models/networkSettings.js');

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    constructor(private https: HttpClient) { }

    login(username: string, password: string): Observable<String> {

        var hostname = netSettings.getHostNameToUse();
        var port = netSettings.getPortToUse();

        var loginData = {'uname':username, 'password':password};
        var url = `https://${hostname}:${port}/login`;

        console.log(`loginData is: ${JSON.stringify(loginData)}`);
        console.log(`About to make login POST request to ${url}...`);

        return this.https.post<any>(url, JSON.stringify(loginData));

    }
}