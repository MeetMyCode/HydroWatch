import { Injectable } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable, of } from 'rxjs';
//import { getHostNameToUse, getLocalNetworkIpToUse, getPiIpToUse, getPortToUse, getWebSocketPortToUse } from './models/networkSettings';
var netSettings = require('../models/networkSettings.js');

//const piIpAddress = '192.168.1.68';
//const localHost = '192.168.1.66';
//const publicIpAddress = '213.31.118.1';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  myWebSocket: WebSocketSubject<string> = webSocket({
    url: `wss://${netSettings.getHostNameToUse()}:${netSettings.getWebSocketPortToUse()}`,
    deserializer: e => e.data
  });

  
  constructor() { }

  getSocket(): WebSocketSubject<string>{
    return this.myWebSocket;
  }


  
  
}

