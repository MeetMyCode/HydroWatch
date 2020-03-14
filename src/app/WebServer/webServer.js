/*#region CONSTANTS/PROPERTIES/VARIABLES ETC*/
const SerialPort = require('serialport')
const mysql = require('mysql');
const MyWebSocket = require('ws');
const https = require('https');
const path = require('path');
const fs = require('fs');
const webServerPort = 8080;
const webSocketPort = 12345;
const webServerHostname = '192.168.1.68';
const dashboardPageAddress = '../index.html';
const distDir = '../assets/Images';

const dbTables2 = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const dbTables = {0:"temperature", 1:"ph", 2:"ec", 3:"orp"};

const dbColumnsInUse = {"t":"temperature", "p":"ph", "e":"ec", "o":"orp"};
const prefixes = {0:"tt",1:"ph",2:"ec",3:"or",};
const Readline = SerialPort.parsers.Readline;

//Stores the interval value in seconds for the timer used to inform the user 
//when the next reading will take place.
var timerInterval; 

const arduinoPortAddress = '/dev/ttyACM0';

var dbConnectionPool = mysql.createPool({
  connectionLimit: '2',
  host     : 'localhost',
  user     : 'hydro',
  password : 'password',
  database : 'sys'
});

/*#endregion*/

//CREATE THE WEBSERVER
createServer(); 

//CREATE WEBSOCKET AND CONNECTIONS/LISTENERS
createWebSocket();

//CREATE SERIALPORT CONNECTION
var port = new SerialPort('/dev/tty.usbmodem14201', {
  baudRate: 9600,
});

function createWebSocket(){
  const server = https.createServer({
    cert: fs.readFileSync('../../../ssl/server.crt'),
    key: fs.readFileSync('../../../ssl/server.key'),
  });
  
  const wss = new MyWebSocket.Server({ server });
  
  server.listen(webSocketPort,webServerHostname);

  //WEB SOCKET EVENT LISTENER
  wss.on('connection', function connection(serverSocket) {

    // IF THE SERVER GETS A MESSAGE FROM THE CLIENT..
    serverSocket.on('message', function incoming(query) {
      var stringQuery = JSON.parse(query);

      switch (stringQuery) {
        case 'timerInterval':
          serverSocket.send(`0${timerInterval}`); 
          break;
      
        default:
          process.stdout.write(`Unknown query received: ${query}`);
          break;
      }
    });

    process.stdout.write('\nConnected to Socket!');

    //GET READINGS FROM ARDUINO & PASS THEM TO DATABASE AND WEB PAGE
    getSensorReadings(serverSocket);

  });

}

function createServer(){

  var options = {
    cert: fs.readFileSync('../../../ssl/server.crt'),
    key: fs.readFileSync('../../../ssl/server.key')
  }

  https.createServer(options, async function (req, res) {

    var urlPrefix = req.url.substring(0,5);
    var tableAndDateSections = req.url.substring(5,).split('/');
    process.stdout.write(`\ntableAndDateSections is: ${tableAndDateSections}`);

    var table = tableAndDateSections[0];
    var date = tableAndDateSections[1];
    var column = tableAndDateSections[2];

    process.stdout.write('\nreq.url prefix is: ' + urlPrefix + ', table is: ' + dbTables[table] + ', date is: ' + date + ' and column is ' + column);

    if (urlPrefix == "/api/" && date != 'null' && column == 'null') {

      process.stdout.write('\napi address for getDataFrom() is: ' + req.url);
      await getDataFrom(table, date).then((dbData)=>{
        //process.stdout.write('\ndbData is: ' + dbData);
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
        var stringifyString = JSON.stringify(dbData);
        res.write(stringifyString);
        process.stdout.write('\nhttp response data is: \n' + dbData);
        res.end();
      });

    }else if(urlPrefix == "/api/" && date == 'null' && column != 'null'){
      process.stdout.write('\napi address for getMinMaxDatePickerDates() is: ' + req.url);
      await getMinMaxDatePickerDates(table, column).then((dbData)=>{
        //process.stdout.write('\ndbData is: ' + dbData);
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
        var stringifyString = JSON.stringify(dbData);
        res.write(stringifyString);
        process.stdout.write('\nhttp response data is: \n' + dbData);
        res.end();
      });

    }else if(urlPrefix == "/api/" && date == 'all' && column != 'null'){

      process.stdout.write('\napi address for getDataFrom() is: ' + req.url);
      await getDataFrom(table, date, column).then((dbData)=>{
        //process.stdout.write('\ndbData is: ' + dbData);
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
        //var stringifyString = JSON.stringify(dbData);
        res.write(dbData);
        process.stdout.write('\nhttp response data is: \n' + dbData);
        res.end();
      });

    }else if(date == 'null' && column == 'null'){

      process.stdout.write('\napi address for getDataFrom() is: ' + req.url);
      await getDataFrom(table).then((dbData)=>{
        //process.stdout.write('\ndbData is: ' + dbData);
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
        //var stringifyString = JSON.stringify(dbData);
        res.write(dbData);
        process.stdout.write('\nhttp response data is: \n' + dbData);
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
          process.stdout.write('Fetching index.html');

          fs.readFile(dashboardPageAddress, function(err,data){
            process.stdout.write('Fetching index.html');

            if (!err) {
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(data, 'utf-8');
              res.end();
              process.stdout.write('index.html sent!');
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

function getDataFrom(table, date='null', column='null') {  
  
    return new Promise((resolve, reject) => {
      process.stdout.write('\nTrying to get data from table: ' + table);
      process.stdout.write(`\nIn getDataFrom(), table: ${table} and date: ${date} and column is: ${column}`);

      //a query string is received as the incoming message. Execute it against the database.
      var result = '';
      var finalResult = '';
      var baseQueryString = 'SELECT * FROM';
      var queryString = '';

      if (date == 'null' && column == 'null') {
        //Select all records for a given table
        queryString = `${baseQueryString} ${dbTables[table]}`;

      }else if(date != 'null' && column == 'null'){
        //Select all records from a given table for a given date.
        var formattedDate = formatDateStringForMySql(date);
        queryString = `${baseQueryString} ${dbTables[table]} WHERE date="${formattedDate}"`;

      }else if(date == 'all' && column != 'null'){
        //Select and entire column of data from a particular table.
        queryString = `SELECT ${column} FROM ${dbTables[table]}`;      
      }else{
        process.stdout.write('\nDuff queryString in getDataFrom()!');
      }

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

            process.stdout.write(`\nPretty print of results:\n`);
            process.stdout.write(JSON.stringify(results,null,4));

            finalResult = prefix + result;

            process.stdout.write(`\nResult of Database Query is: ${results.length} entries`);
            resolve(finalResult);

          });
          dbConnectionPool.releaseConnection(poolConnection);
        }
      })

    })

}

function getMinMaxDatePickerDates(table, column) {  
  
  return new Promise((resolve, reject) => {
    process.stdout.write('\nTrying to get data from table: ' + table);
    process.stdout.write(`\nIn getMinMaxDatePickerDates(), table: ${table} and column: ${column}`);


    //a query string is received as the incoming message. Execute it against the database.
    var result = '';
    var finalResult = '';
    var queryString;

    if (table && column ) {
      //Select all records for a given table
      queryString = `SELECT Min(${column}), Max(${column}) FROM ${dbTables[table]}`;

    }else{
      process.stdout.write('\nDuff queryString in getDataFrom()!');
    }

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

          process.stdout.write(`\nResult of Database Query is: ${results.length} entries`);
          resolve(finalResult);

        });
        dbConnectionPool.releaseConnection(poolConnection);
      }
    })

  })

}

function formatDateStringForMySql(dateString){

  var formattedDatestring;

  if (dateString != null) {
    process.stdout.write(`\ndateString in formatDateStringForMySql is ${dateString}`);
    var tempString = dateString.split('-');
    var day = tempString[0];
    var month = tempString[1];
    var year = tempString[2];

    formattedDatestring = `${year}-${month}-${day}`;   
  }

  return formattedDatestring;
}

function getSensorReadings(socket){

  /*
    >>function getSensorReadings(socket)<<
  This function takes a web socket as an argument. 
  Data is received from the serialport connection to the arduino which is then
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

    //Check for timer interval (prefix = 0) and store in var timerInterval.
    var prefix = data[0];
    if (prefix == '0') {
      process.stdout.write(`\nprefix is 0`);
      var reading = data.toString().substring(1,);
      timerInterval = parseFloat(reading);
      process.stdout.write(`timerInterval is: ${timerInterval/1000} seconds.`);
    }else{
      //GET A CONNECTION FROM THE POOL, CONNECT TO DATABASE & SEND DATA TO DATABASE. 
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
    }

  });

}

/*#region METHODS */
  
function filterPrefixFromArduinoReading(dataFromArduino, poolConnection){

  var prefix = dataFromArduino[0].toLowerCase();
  process.stdout.write("\nreading prefix is: " + prefix);

  //Check for '0' to ignore initial flag from arduino that sends the timer interval
  if (prefix != '0') {
    switch (prefix) {
      case "t":
        var temp = dataFromArduino.substring(1, );
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
        process.stdout.write('\nError - Unknown Prefix received in function: addReadingToDataBase(dataFromArduino)');
        process.stdout.write('\nPrefix:' + prefix);
        dbConnectionPool.releaseConnection(poolConnection);
        break;
    }    
  }


}

function sentoDbTable(readingPrefix, readingCategory, poolConnection){

    //process.stdout.write('\ndate.now.toLocalString is: ' + new Date().toISOString());

    var query = 'INSERT INTO ' + dbTables2[readingPrefix] + ' (date, time, ' + dbColumnsInUse[readingPrefix] + ') VALUES (?,?,?)';
    var timeStamp = formatISODateTimeToSQLDateTime(new Date().toISOString());
    var dateAndTimeSections = extractSqlDateAndTimeStringsFromDateTime(timeStamp);
    var date = dateAndTimeSections[0];
    var time = dateAndTimeSections[1];
  
    poolConnection.query(
      query.toString(),
      [date,
      time,
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

function formatISODateTimeToSQLDateTime(stringToFormat){

  //process.stdout.write('\nISO Date String to format is: ' + stringToFormat.toString());

  var dateTimeString = stringToFormat.toString().replace("T"," ").substring(0, 19);

  //process.stdout.write('\nDateTime String is: ' + dateTimeString);

  return dateTimeString;
}

/*#endregion*/

/*#region  UTILITY METHODS */
function extractSqlDateAndTimeStringsFromDateTime(dateTime){
  var dateAndTime = new Array();
  process.stdout.write(`dateAndTimeString is: ${dateTime}`);

  var date = dateTime.substring(0,10);
  var time = dateTime.substring(11,19);

  dateAndTime.push(date);
  dateAndTime.push(time);

  process.stdout.write(`\nIn extractSqlDateAndTimeStringsFromDateTime(), dateString is: ${date}`);
  process.stdout.write(`\nIn extractSqlDateAndTimeStringsFromDateTime(), timeString is: ${time}`);  

  return dateAndTime;
}

/*//#endregion */