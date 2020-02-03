const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
//const Readline = require('@serialport/parser-readline')

const WebSocket = require('ws'); 
const wss = new WebSocket.Server({ 
  port: 12345
});
 
wss.on('connection', function connection(serverSocket) {

  // IF THE SERVER GETS A MESSAGE FROM THE CLIENT..
  serverSocket.on('message', function incoming(message) {
    process.stdout.write('received: %s', message);
  });


  process.stdout.write('Connected!');

  //SEND MESSAGE TO CLIENT FROM SERVER
  //serverSocket.send('Hello from the Server!');

  getTempReadings(serverSocket);
  //serverSocket.send(arduinoReading);

});



function getTempReadings(socket){

  const port = new SerialPort('/dev/tty.usbmodem14201', {
    baudRate: 9600,
  });

  var parser = new Readline({
    delimiter: '\r\n',
  })
  port.pipe(parser);
  parser.on('data', function (data) {
    process.stdout.write('\n'+data);
    socket.send(data);
    //return data.toString();
  });

}
  
