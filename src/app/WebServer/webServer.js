const SerialPort = require('serialport')
const mysql = require('mysql');
const WebSocket = require('ws');

const dbTables = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const dbColumnsInUse = {"t":"temp", "p":"ph", "e":"ec", "o":"orp"};
const Readline = SerialPort.parsers.Readline;

const arduinoPortAddress = '/dev/ttyACM0';

var dbConnectionPool = mysql.createPool({
  connectionLimit: '2',
  host     : 'localhost',
  user     : 'hydro',
  password : 'password',
  database : 'sys'
});

const wss = new WebSocket.Server({ 
  port: 12345
});

const port = new SerialPort('/dev/tty.usbmodem14201', {
  baudRate: 9600,
});
 
wss.on('connection', function connection(serverSocket) {

  // IF THE SERVER GETS A MESSAGE FROM THE CLIENT..
  serverSocket.on('message', function incoming(message) {
    process.stdout.write('\nreceived: %s', message);
  });

  process.stdout.write('\nConnected to Socket!');

  getSensorReadings(serverSocket);

});

function getSensorReadings(socket, poolConnection){

  if (port.isOpen === false) {
    console.log('\nPort Closed - creating new connection...');
    port = new SerialPort('/dev/tty.usbmodem14201', {
      baudRate: 9600,
    });    
  }

  var parser = new Readline({
    delimiter: '\r\n',
  })
  port.pipe(parser);
  parser.on('data', function (data) {
    //process.stdout.write("\n" + data);

    //GET A CONNECTION FROM THE POOL AND CONNECT TO DATABASE  
    dbConnectionPool.getConnection((err, poolConnection) => {

      if (err) {
        process.stdout.write('\nError getting pool connection: ' + err);
      }else{
        process.stdout.write('\nDatabase Connection from Pool established!');
        
        //FILTER DATA BEFORE SENDING TO DATABASE
        filterPrefixFromArduinoReading(data, poolConnection);
      }
    });

    //SEND DATA TO WEB DASHBOARD
    socket.send(data);
  });

}
  
function filterPrefixFromArduinoReading(dataFromArduino, poolConnection){

  var prefix = dataFromArduino[0].toLowerCase();
  console.log("\nreading prefix is: " + prefix);

  switch (prefix) {
    case "t":
      temp = dataFromArduino.substring(1, );
      sentoDbTable(prefix, temp);
      //sendToDbTempTable(temp);
      dbConnectionPool.releaseConnection(poolConnection)
      break;

    case "p":
      var ph = dataFromArduino.substring(1, );
      sentoDbTable(prefix, ph);
      //sendToDbPhTable(ph);
      dbConnectionPool.releaseConnection(poolConnection);
      break;

    case "e":
      var ec = dataFromArduino.substring(1, );
      sentoDbTable(prefix,ec);
      //sendToDbEcTable(ec);
      dbConnectionPool.releaseConnection(poolConnection);
      break;

    case "o":
      var orp = dataFromArduino.substring(1, );
      sentoDbTable(prefix,orp);
      //sendToDbOrpTable(orp);
      dbConnectionPool.releaseConnection(poolConnection);
      break;	

    default:
      console.log('\nError - Unknown Prefix received in function: addReadingToDataBase(dataFromArduino)');
      dbConnectionPool.releaseConnection(poolConnection);
      break;
  }
}

function sentoDbTable(readingPrefix, readingCategory){

    //process.stdout.write('\ndate.now.toLocalString is: ' + new Date().toISOString());

    var query = 'INSERT INTO ' + dbTables[readingPrefix] + '(timestamp, ' + dbColumnsInUse[readingPrefix] + ') VALUES (?,?)';
    var timeStamp = formatSIODateTimeToSQLDateTime(new Date().toISOString());
  
    dbConnectionPool.query(
      query.toString(),
      [timeStamp,
      readingCategory], 
      function (error, results, fields) {
  
      try {  
        if (error) throw error;    
      } catch (error) {
        process.stdout.write('\nError thrown when trying to connect to db: ' + error);
      }
      process.stdout.write('\nreading written to database successfully!');
    });
  
    //process.stdout.write('\nAwaiting database write...');

}

function formatSIODateTimeToSQLDateTime(stringToFormat){

  //process.stdout.write('\nISO Date String to format is: ' + stringToFormat.toString());

  var dateTimeString = stringToFormat.toString().replace("T"," ").substring(0, 19);

  //process.stdout.write('\nDateTime String is: ' + dateTimeString);

  return dateTimeString;
}