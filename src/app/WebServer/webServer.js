const SerialPort = require('serialport')
const mysql = require('mysql');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const webServerPort = 8080;
//const dashboardPageAddress = 'Users/rosshiggins/Desktop/Software Development/Angular Development/HydroWatch/index.html';
const dashboardPageAddress = '/Users/rosshiggins/Desktop/Software Development/Angular Development/HydroWatch/HydroWatch/dist/HydroWatch/index.html';
const baseDir = '/Users/rosshiggins/Desktop/Software Development/Angular Development/HydroWatch/HydroWatch/dist/HydroWatch';

const dbTables = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const dbColumnsInUse = {"t":"temp", "p":"ph", "e":"ec", "o":"orp"};
const Readline = SerialPort.parsers.Readline;

const fs = require('fs');

const arduinoPortAddress = '/dev/ttyACM0';

var dbConnectionPool = mysql.createPool({
  connectionLimit: '2',
  host     : 'localhost',
  user     : 'hydro',
  password : 'password',
  database : 'sys'
});

//CREATE THE WEBSERVER

http.createServer(function (req, res) {

  //process.stdout.write('\n__dirname is: ' + __dirname);
  //process.stdout.write('\nreq.url is: ' + req.url);

  var mimeType = path.extname(req.url);

  if (req.url === '/') {
    mimeType = '/';
  }
  process.stdout.write('\nreq.url - mimeType is: ' + req.url + ' - ' + mimeType);



  switch (mimeType) {
    case '/':
      //return the dashboard page
      fs.readFile(dashboardPageAddress, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data, 'utf-8');
          res.end();
        }else{
          process.stdout.write('\nError loading index.html: ' + err);
        }
      });
    break;

    case '.js':
      fs.readFile(baseDir + req.url, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'text/javascript'});
          res.write(data, 'utf-8');
          res.end();
        }else{
          process.stdout.write('\nError loading .js: ' + err);
        }
      });
    
    break;

    case '.css':
      fs.readFile(baseDir + req.url, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'text/css'});
          res.write(data, 'utf-8');
          res.end();
        }else{
          process.stdout.write('\nError loading .css: ' + err);
        }
      });
    break;

    case '.png':
      fs.readFile(baseDir + req.url, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'image/png'});
          res.write(data);
          res.end();
        }else{
          process.stdout.write('\nError loading .png: ' + err);
        }
      });
    break;
  
    case '.ico':
      fs.readFile(baseDir + req.url, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'image/x-icon'});
          res.write(data);
          res.end();
        }else{
          process.stdout.write('\nError loading .ico: ' + err);
        }
      });
    break;

    case '.jpg':
      fs.readFile(baseDir + req.url, function(err,data){

        if (!err) {
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          res.write(data);
          res.end();
        }else{
          process.stdout.write('\nError loading .jpg: ' + err);
        }
      });
    break;


    default:
      process.stdout.write('Received an unrecognised request URL in http.createServer(): ' + req.url + 'END OF URL');
      break;
  }

}).listen(webServerPort);

//END OF WEBSERVER CODE

const wss = new WebSocket.Server({ 
  port: 12345
});

var port = new SerialPort('/dev/tty.usbmodem14201', {
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