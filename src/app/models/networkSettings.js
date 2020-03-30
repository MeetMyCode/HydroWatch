
//1 for developing on localhost (no RPi being used), 
//2 for production mode on RPi via public IP and 
//3 for local development using RPi.
const networkMode = 1; 

const sslPort = 443;
const port = 8080;

const publicIp = '213.31.118.1';
const localhost = 'localhost';

const webSocketPort = 12345;
const piIpAddress = '192.168.1.68';
const localNetworkIp = '192.168.1.66';

var ipAddressToUse;
var portToUse;

if (networkMode == 1) {
    ipAddressToUse = localhost;
    portToUse = port;
} else if(networkMode == 2) {
    ipAddressToUse = publicIp;
    portToUse = sslPort;
}else if(networkMode == 3){
    ipAddressToUse = piIpAddress;
    portToUse = port;
}else{
    process.stdout.write('\nError: In netWorkSettings,js, unknown networkMode value received.');
}

exports.getPortToUse = function(){
    return port;
}

exports.getHostNameToUse = function(){
    return localhost;
}

exports.getWebSocketPortToUse = function(){
    return webSocketPort;
} 


