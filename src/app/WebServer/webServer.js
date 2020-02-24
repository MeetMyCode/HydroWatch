//import { Observable, of, from, observable } from 'rxjs';
const SerialPort = require('serialport')
const mysql = require('mysql');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const webServerPort = 8080;
const dashboardPageAddress = '/Users/rosshiggins/Desktop/Software Development/Angular Development/HydroWatch/HydroWatch/dist/HydroWatch/index.html';
const distDir = '/Users/rosshiggins/Desktop/Software Development/Angular Development/HydroWatch/HydroWatch/dist/HydroWatch';

const dbTables2 = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const dbTables = {0:"temperature", 1:"ph", 2:"ec", 3:"orp"};

const dbColumnsInUse = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const prefixes = {0:"tt",1:"ph",2:"ec",3:"or",};
const Readline = SerialPort.parsers.Readline;

const arduinoPortAddress = '/dev/ttyACM0';

var dbConnectionPool = mysql.createPool({
  connectionLimit: '2',
  host     : 'localhost',
  user     : 'hydro',
  password : 'password',
  database : 'sys'
});

//CREATE THE WEBSERVER
createServer(); 

function createServer(){
  http.createServer(async function (req, res) {

    var url = req.url.substring(0,5);
    var table = req.url.substring(5,);
    console.log('\nreq.url prefix is: ' + url + ' and table is: ' + dbTables[table]);

    if (url == "/api/") {
      process.stdout.write('api address is: ' + req.url);
      await getDataFrom(table).then((dbData)=>{
        //process.stdout.write('\ndbData is: ' + dbData);
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
        var stringifyString = JSON.stringify(dbData);
        res.write(stringifyString);
        //process.stdout.write('\nhttp response data is: ' + dbData);
        res.end();
      });


    }else{
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
          fs.readFile(distDir + req.url, function(err,data){

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
          fs.readFile(distDir + req.url, function(err,data){

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
          fs.readFile(distDir + req.url, function(err,data){

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
          fs.readFile(distDir + req.url, function(err,data){

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
          fs.readFile(distDir + req.url, function(err,data){

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
    }



  }).listen(webServerPort);  
}


//END OF WEBSERVER CODE

function getDataFrom(table) {

    return new Promise((resolve, reject) => {
      process.stdout.write('\nTrying to get data from table: ' + table);

      //a query string is received as the incoming message. Execute it against the database.
      var result = '';
      var finalResult = '';
      var baseQueryString = 'SELECT * FROM ';
      var queryString = baseQueryString + dbTables[table];

      process.stdout.write('\nQuery string is: ' + queryString);
      dbConnectionPool.getConnection((err, poolConnection) => {
        if (err) {
          process.stdout.write('\nError getting pool connection: ' + err);
        }else{
          process.stdout.write('\nDatabase Connection from Pool established!');

          poolConnection.query(
            queryString,
            function (error, results, fields) {
              process.stdout.write('\nQuery sent to database: ' + queryString);
              //process.stdout.write('\nResult of Query: ' + JSON.stringify(results));      
            try {  
              if (error) throw error;    
            } catch (error) {
              process.stdout.write('\nError thrown when trying to connect to db in poolConnection.query(): ' + error);
              process.stdout.write('\nQuery string was: ' + queryString);

            }
            var prefix = prefixes[table];
            result = JSON.stringify(results);
            finalResult = prefix + result;

            process.stdout.write(`\nResult of Database Query is: ' + ${results.length} entries`);
            resolve(finalResult);

          });
          dbConnectionPool.releaseConnection(poolConnection);
        }
      })

    })

}

//CREATE WEBSOCKET AND SERIALPORT CONNECTIONS/LISTENERS
const wss = new WebSocket.Server({ 
  port: 12345
});

var port = new SerialPort('/dev/tty.usbmodem14201', {
  baudRate: 9600,
});
 
wss.on('connection', function connection(serverSocket) {

  // IF THE SERVER GETS A MESSAGE FROM THE CLIENT..
  serverSocket.on('message', function incoming(queryString) {
  });

  process.stdout.write('\nConnected to Socket!');

  //GET READINGS FROM ARDUINO & PASS THEM TO DATABASE AND WEB PAGE
  getSensorReadings(serverSocket);

});

//END OF WEB SOCKET AND SERIALPORT CONNECTION CREATION CODE

function getSensorReadings(socket){

  /*
    >>function getSensorReadings(socket)<<
  This function takes a web socket as an argument. 
  Data is received from the seriaport connection to the arduino which is then
  filtered/formatted for before sending to the corresponding database tables
  and also forwarded on the dashbpoard web page via the web socket.
  */

  if (port.isOpen === false) {
    console.log('\nPort Closed - creating new connection...');
    port = new SerialPort('/dev/tty.usbmodem14201', {
      baudRate: 9600,
    },(err)=>{
      process.stdout.write('\n' + err);
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
      sentoDbTable(prefix, temp, poolConnection);
      dbConnectionPool.releaseConnection(poolConnection)
      break;

    case "p":
      var ph = dataFromArduino.substring(1, );
      sentoDbTable(prefix, ph, poolConnection);
      dbConnectionPool.releaseConnection(poolConnection);
      break;

    case "e":
      var ec = dataFromArduino.substring(1, );
      sentoDbTable(prefix,ec, poolConnection);
      dbConnectionPool.releaseConnection(poolConnection);
      break;

    case "o":
      var orp = dataFromArduino.substring(1, );
      sentoDbTable(prefix,orp, poolConnection);
      dbConnectionPool.releaseConnection(poolConnection);
      break;	

    default:
      console.log('\nError - Unknown Prefix received in function: addReadingToDataBase(dataFromArduino)');
      dbConnectionPool.releaseConnection(poolConnection);
      break;
  }
}

function sentoDbTable(readingPrefix, readingCategory, poolConnection){

    //process.stdout.write('\ndate.now.toLocalString is: ' + new Date().toISOString());

    var query = 'INSERT INTO ' + dbTables2[readingPrefix] + '(timestamp, ' + dbColumnsInUse[readingPrefix] + ') VALUES (?,?)';
    var timeStamp = formatSIODateTimeToSQLDateTime(new Date().toISOString());
  
    poolConnection.query(
      query.toString(),
      [timeStamp,
      readingCategory], 
      function (error, results, fields) {
  
      try {  
        if (error) throw error;    
      } catch (error) {
        process.stdout.write('\nError thrown when trying to connect to db: ' + error);
        process.stdout.write('\nQuery string was: ' + query.toString());
        process.stdout.write('\nTable prefix was: ' + readingPrefix);


      }
      process.stdout.write('\nreading written to database successfully! Query string was:' + query.toString());
    });
  
    //process.stdout.write('\nAwaiting database write...');

}

function formatSIODateTimeToSQLDateTime(stringToFormat){

  //process.stdout.write('\nISO Date String to format is: ' + stringToFormat.toString());

  var dateTimeString = stringToFormat.toString().replace("T"," ").substring(0, 19);

  //process.stdout.write('\nDateTime String is: ' + dateTimeString);

  return dateTimeString;
}