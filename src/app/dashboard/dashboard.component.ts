import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { DatabaseControllerService } from '../database-controller.service';
import { Gauge } from 'node_modules/gaugeJS/dist/gauge.js';
var Chart = require('chart.js');



@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
  })

export class DashboardComponent implements OnInit {

	numPixelsPerDataPoint = 10; //used to set the width of the graph container, based on the screen size.

	readingEvery = 5; //This should be the same as the delay() value in the arduino sketch main loop, measured in seconds.
	sensorCount = 3; //Should be four sensors once you have bought them all.
	timeTillReading = 5; //this is the reading bound to the webpage interface that informs the user when the next reading will occur.

	selectedChart: number = 0;
	arduinoReading: string; //this is the reaading received from the mcu, formatted as prefix (specifies which sensor) + reading.
	TempGauge: Gauge;
	PhGauge: Gauge;
	EcGauge: Gauge;
	OrpGauge: Gauge;

	getEverythingQueryString = "SELECT * FROM ";

	//ARDUINO READING PROPERTIES
	currentTemp: string = "22.65";
	maxTemp: string = '40';
	currentPh: string = "6.54"
	maxPh:string = '14';
	currentEc: string = "1.6";
	maxEc:string = '4';
	currentOrp: string = "300";
	maxOrp:string = '600';

	myChart = null;
	resizeCount: number;
	charts = ["temperature", "ph", "ec","orp"];
	chartMaxValues = {0:this.maxTemp, 1:this.maxPh, 2:this.maxEc, 3:this.maxOrp};

  
	TempOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 0.8, // Relative radius
		pointer: {
		length: 0.55, // // Relative to gauge radius
		strokeWidth: 0.035, // The thickness
		color: '#000000' // Fill color
		},
		limitMax: true,     // If false, max value increases automatically if value > maxValue
		limitMin: true,     // If true, the min value of the gauge will be fixed
		colorStart: '#6FADCF',   // Colors
		colorStop: '#8FC0DA',    // just experiment with them
		strokeColor: '#E0E0E0',  // to see which ones work best for you
		generateGradient: true,
		highDpiSupport: true,     // High resolution support
		// renderTicks is Optional
		renderTicks: {
		divisions: 8,
		divWidth: 1,
		divLength: 1,
		divColor: '#333333',
		subDivisions: 5,
		subLength: 0.5,
		subWidth: 0.9,
		subColor: '#666666'
		},
		staticZones: [
		{strokeStyle: "#F03E3E", min: 0, max: 15}, // Red
		{strokeStyle: "#30B32D", min: 15, max: 30}, // Green
		{strokeStyle: "#F03E3E", min: 30, max: 40}, // Red
		],
		staticLabels: {
		font: "1.5em sans-serif",  // Specifies font
		labels: [0,10,20,30,40],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	PhOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 0.8, // Relative radius
		pointer: {
		length: 0.55, // // Relative to gauge radius
		strokeWidth: 0.035, // The thickness
		color: '#000000' // Fill color
		},
		limitMax: false,     // If false, max value increases automatically if value > maxValue
		limitMin: false,     // If true, the min value of the gauge will be fixed
		colorStart: '#6FADCF',   // Colors
		colorStop: '#8FC0DA',    // just experiment with them
		strokeColor: '#E0E0E0',  // to see which ones work best for you
		generateGradient: true,
		highDpiSupport: true,     // High resolution support
		// renderTicks is Optional
		renderTicks: {
		divisions: 14,
		divWidth: 1,
		divLength: 1,
		divColor: '#333333',
		subDivisions: 5,
		subLength: 0.5,
		subWidth: 0.9,
		subColor: '#666666'
		},
		staticZones: [
		{strokeStyle: "#F03E3E", min: 0, max: 5.5}, // Red
		{strokeStyle: "#30B32D", min: 5.5, max: 7}, // Green
		{strokeStyle: "#F03E3E", min: 7, max: 14}, // Red
		],
		staticLabels: {
		font: "1.5em sans-serif",  // Specifies font
		labels: [0,2,4,6,8,10,12,14],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	EcOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 0.8, // Relative radius
		pointer: {
		length: 0.55, // // Relative to gauge radius
		strokeWidth: 0.035, // The thickness
		color: '#000000' // Fill color
		},
		limitMax: true,     // If false, max value increases automatically if value > maxValue
		limitMin: true,     // If true, the min value of the gauge will be fixed
		colorStart: '#6FADCF',   // Colors
		colorStop: '#8FC0DA',    // just experiment with them
		strokeColor: '#E0E0E0',  // to see which ones work best for you
		generateGradient: true,
		highDpiSupport: true,     // High resolution support
		// renderTicks is Optional
		renderTicks: {
		divisions: 8,
		divWidth: 1,
		divLength: 1,
		divColor: '#333333',
		subDivisions: 5,
		subLength: 0.5,
		subWidth: 0.9,
		subColor: '#666666'
		},
		staticZones: [
		{strokeStyle: "#F03E3E", min: 0, max: 1}, // Red
		{strokeStyle: "#30B32D", min: 1, max: 2}, // Green
		{strokeStyle: "#F03E3E", min: 2, max: 4}, // Red
		],
		staticLabels: {
		font: "1.5em sans-serif",  // Specifies font
		labels: [0,1,2,3,4],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	OrpOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 0.8, // Relative radius
		pointer: {
		length: 0.55, // // Relative to gauge radius
		strokeWidth: 0.035, // The thickness
		color: '#000000' // Fill color
		},
		limitMax: false,     // If false, max value increases automatically if value > maxValue
		limitMin: false,     // If true, the min value of the gauge will be fixed
		colorStart: '#6FADCF',   // Colors
		colorStop: '#8FC0DA',    // just experiment with them
		strokeColor: '#E0E0E0',  // to see which ones work best for you
		generateGradient: true,
		highDpiSupport: true,     // High resolution support
		// renderTicks is Optional
		renderTicks: {
		divisions: 12,
		divWidth: 1,
		divLength: 1,
		divColor: '#333333',
		subDivisions: 5,
		subLength: 0.5,
		subWidth: 0.9,
		subColor: '#666666'
		},
		staticZones: [
		{strokeStyle: "#F03E3E", min: 0, max: 250}, // Red
		{strokeStyle: "#30B32D", min: 250, max: 400}, // Green
		{strokeStyle: "#F03E3E", min: 400, max: 600}, // Red
		],
		staticLabels: {
		font: "1.5em sans-serif",  // Specifies font
		labels: [0,100,200,300,400,500,600],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	constructor(private myWebSocketService: WebSocketService, private databaseService: DatabaseControllerService) {	}

	ngOnInit(){
		this.getArduinoReading();
	}

	async chartButtonClicked(event){
		//alert("chartButtonClicked event fired!");
		var eventTargetId = (<HTMLInputElement>event.target).id;
		switch (eventTargetId) {
			case 'tempButton':
				this.selectedChart = 0;
				break;

			case 'phButton':
				this.selectedChart = 1;
				break;

			case 'ecButton':
				this.selectedChart = 2;
				break;

			case 'orpButton':
				this.selectedChart = 3;
				break;
		
			default:
				console.log('Unknown chart button reaceived in chartButtonClicked().');
				break;
		}

		this.myChart.destroy();
		await this.initialiseGraph();

		//Auto scroll to the beginning.
		var val = $('.chartAreaWrapper').scrollLeft();
		$('.chartAreaWrapper').scrollLeft(-val);	
	};

	ngAfterViewInit() {
		this.initialiseAllGauges();
	}
  
	async initialiseGraph() {

		console.log('Enter initialiseGraph().');

		await this.getDatabaseData().then((dataArray)=>{

			console.log('Enter getDatabaseData().then()');

			//graph variables
			var xAxisData = new Array();
			var yAxisData = new Array();
			var xAxisTitle;
			var yAxisTitle;
			var dataSetLabel;

			//console.log('graphFromDb is: ' + dataArray.toString());

			//Time labels or x-axis
			xAxisData = this.reformatXAxisData(dataArray[0]);
			var arrayOfDates = xAxisData[0];
			//console.log('Start array of dates = ' + arrayOfDates);

			//Sensor reading values for y-axis.
			yAxisData = dataArray[1];	

			this.setChartAreaWidth(yAxisData);


			switch (this.selectedChart){			
				//temp
				case 0:
					//populate graph with data here.
					xAxisTitle = 'Time';
					yAxisTitle = 'Temperature in Degrees Celsius';
					dataSetLabel = 'Temp';
					break;
					
				//ph	
				case 1:
					//populate graph with data here.
					xAxisTitle = 'Time';
					yAxisTitle = 'pH';
					dataSetLabel = 'pH';
					break;

				//ec
				case 2:
					//populate graph with data here.
					xAxisTitle = 'Time';
					yAxisTitle = 'EC in mS/cm';
					dataSetLabel = 'EC';
					break;

				//orp
				case 3:
					//populate graph with data here.
					xAxisTitle = 'Time';
					yAxisTitle = 'ORP in mV';
					dataSetLabel = 'ORP';
					break;
			
				default:	
					console.log('Unknown Chart Requested - ' + this.selectedChart);			
					break;
			}

			//test chart code start

			console.log('yAxisdata count is: ' + yAxisData.length);
			//console.log(`arrayOfDates is ${arrayOfDates}`);
			var rectangleSet = false;
			var chartData = {
				//labels: this.generateLabels(),
				labels: this.generateLabels(),
				datasets: [{
					labels: dataSetLabel,
					//labels: dataSetLabel,
					//data: this.generateData()
					data: yAxisData,
					fill: true,
					borderColor: 'green'
				}]
			};
			var chartOptions = {
				maintainAspectRatio: false,
				responsive: true,
				tooltips: {
					enabled: true
				},
				legend: {
					display: true
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: xAxisTitle,
							fontSize: 20,							
						},
						ticks: {
							beginAtZero: true,
							min: 0,
							fontSize: 12,
							display: true,
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: yAxisTitle,
							fontSize: 20,							
						},
						ticks: {
							display: true,
							min: 0,
							max: parseInt(this.chartMaxValues[this.selectedChart]),
							fontSize: 12,
							beginAtZero: true
						}
					}]
				},
				animation: {
					duration: 1,
					onComplete: function () {
						if (!rectangleSet) {

							var scale = window.devicePixelRatio;                       

							//var sourceCanvas = myChart.chart.canvas;
							var sourceCanvas = <HTMLCanvasElement>document.getElementById('myChart');

							var copyWidth = myChart.scales['y-axis-0'].width - 10;
							var copyHeight = myChart.scales['y-axis-0'].height + myChart.scales['y-axis-0'].top + 10;

							var targetCtx = (<HTMLCanvasElement>document.getElementById("axis-Test")).getContext("2d");

							targetCtx.scale(scale, scale);
							targetCtx.canvas.width = copyWidth * scale;
							targetCtx.canvas.height = copyHeight * scale;

							targetCtx.canvas.style.width = `${copyWidth}px`;
							targetCtx.canvas.style.height = `${copyHeight}px`;
							targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth * scale, copyHeight * scale, 0, 0, copyWidth * scale, copyHeight * scale);

							var sourceCtx = sourceCanvas.getContext('2d');

							// Normalize coordinate system to use css pixels.

							sourceCtx.clearRect(0, 0, copyWidth * scale, copyHeight * scale);
							rectangleSet = true;
						}
					},
					onProgress: function () {
						if (rectangleSet === true) {
							var copyWidth = myChart.scales['y-axis-0'].width;
							var copyHeight = myChart.scales['y-axis-0'].height + myChart.scales['y-axis-0'].top + 10;

							var sourceCtx = myChart.chart.canvas.getContext('2d');
							sourceCtx.clearRect(0, 0, copyWidth, copyHeight);
						}
					}
				}
			}	
	
			//Make sure to set the canvas width and height, otherwise a drawImage() method error is thrown 
			//because a dimensonless canvas has been passed in to new Chart().
			var myChartCanvas = <HTMLCanvasElement>document.getElementById('myChart');
			myChartCanvas.width = innerWidth;
			myChartCanvas.height = innerHeight;
			var myChart = new Chart(myChartCanvas, {
				type: 'line',
				data: chartData,
				options: chartOptions
			});

			this.myChart = myChart;

			//this.addData(5, chartTest); 

			//test chart code end

		}); //returns data for x & y axes, as well as the max value for the y-axis data

	}

	setChartAreaWidth(yAxisData){

		if (yAxisData.length >= 50 && ((yAxisData.length * this.numPixelsPerDataPoint) >= $(window).height())) {
			$('.chartAreaWrapper2').css('width', `${yAxisData.length * this.numPixelsPerDataPoint}px`);
		}else{
			$('.chartAreaWrapper2').css('width', '100%');
		}

	}

	//test functions start
	generateData() {
		var chartData = [];
		for (var x = 0; x < 100; x++) {
			chartData.push(Math.floor((Math.random() * 100) + 1));
		}
		return chartData;
	}

	addData(numData, chart) {
		for (var i = 0; i < numData; i++) {
			chart.data.datasets[0].data.push(Math.random() * 100);
			chart.data.labels.push("Label" + i);
			var newwidth = $('.chartAreaWrapper2').width() + 60;
			$('.chartAreaWrapper2').width(newwidth);
		}
	}

	generateLabels() {
        var chartLabels = [];
        for (var x = 0; x < 300; x++) {
            chartLabels.push("Label" + x);
        }
        return chartLabels;
    }

	//test functions end

	reformatXAxisData(xAxisDataArray){

		var arrayOfDates = new Array();
		var arrayOfTimes = new Array();

		xAxisDataArray.forEach(dateTimeElement => {

			//console.log('dateTimeElement array is: '+ dateTimeElement);
			
			//Split array of DateTime strings into seperate array containing a date and a time.
			var dateAndTime = dateTimeElement.split(' ');
			//console.log('dateAndTime is: ' + dateAndTime);

			//Reformat the dates from yyy-mm-dd to dd-mm-yyyy
			var dateParts = dateAndTime[0].split('-');
			var year = dateParts[0];
			var mon = dateParts[1];
			var day = dateParts[2];
			var stringToAdd = `${day}-${mon}-${year}`;

			//push to arrays for return values.
			arrayOfDates.push(stringToAdd);
			arrayOfTimes.push(dateAndTime[1]);
		});

		//console.log('Formatted dateArray: ' + arrayOfDates);
		//console.log('Formatted timeArray: ' + arrayOfTimes);

		return [arrayOfDates,arrayOfTimes]
	}

	async getDatabaseData() :Promise<any[]>{
		console.log('Enter getDatabaseData().');

		return await new Promise(async (resolve,reject)=>{

			var dataArray = new Array();

			var dbResultObserver = await this.databaseService.getData(this.selectedChart);
			dbResultObserver.subscribe((data)=>{

				//console.log('\nReturned data in getDatabaseData() is: ' + data);
				var dataIncludingPrefix = JSON.parse(data);
				//console.log('dataIncludingPrefix is: ' + dataIncludingPrefix);
				var prefix = dataIncludingPrefix.substring(0,2);
				//console.log("\nReading prefix from server is: " + prefix);
				var arrayContainingJson = dataIncludingPrefix.substring(2,);
				//console.log("\nArray containing JSON is: " + arrayContainingJson);
				var dbRowsAsJson:JSON = JSON.parse(arrayContainingJson);
				//console.log("\ndbRows as json are: " + JSON.stringify(dbRowsAsJson));
				
				var xAxisData = new Array();
				var yAxisData = new Array();

				for (const row in dbRowsAsJson) {
					if (dbRowsAsJson.hasOwnProperty(row)) {
						//time stamp arrives as format: "1980-02-27T08:23:00.000Z". Replace 'T' with a space and substring to
						//"1980-02-27 08:23:00" format.
						var timeStamp :string = (dbRowsAsJson[row]['timestamp']).replace('T',' ').substring(0,19);
						var reading :string = dbRowsAsJson[row][this.charts[this.selectedChart]];
						//console.log('this.charts[this.selectedChart] is: ' + this.charts[this.selectedChart]);
						//console.log('timeStamp is: ' + timeStamp);
						//console.log('reading is: ' + reading);
						xAxisData.push(timeStamp);
						yAxisData.push(reading);						
					}
				}
				//console.log(`xAxisData is: ${xAxisData.toString()} containing ${xAxisData.length} entries`);
				//console.log(`yAxisData is: ${yAxisData.toString()} containing ${yAxisData.length} entries`);

				dataArray = [xAxisData,yAxisData];

				resolve(dataArray);

			});

		});


	}

	initialiseAllGauges() {
		this.initTempGauge();
		this.initPhGauge();
		this.initEcGauge();
		this.initOrpGauge();
	}

	initTempGauge(){
		var TempCanvas = <HTMLCanvasElement>document.getElementById('TempGauge'); // your canvas element
		var ctx = TempCanvas.getContext('2d');
		ctx.canvas.width = innerWidth;
		ctx.canvas.height = innerHeight;

		this.TempGauge = new Gauge(TempCanvas).setOptions(this.TempOptions); // create sexy gauge!
		this.TempGauge.maxValue = this.maxTemp; // set max gauge value
		this.TempGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.TempGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.TempGauge.set(22); // set actual value


	}

	initPhGauge(){
		var PhCanvas = <HTMLCanvasElement>document.getElementById('PhGauge'); // your canvas element
		var ctx = PhCanvas.getContext('2d');
		ctx.canvas.width = innerWidth;
		ctx.canvas.height = innerHeight;

		this.PhGauge = new Gauge(PhCanvas).setOptions(this.PhOptions); // create sexy gauge!
		this.PhGauge.maxValue = this.maxPh; // set max gauge value
		this.PhGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.PhGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.PhGauge.set(6.5); // set actual value


	}

	initEcGauge(){
		var EcCanvas = <HTMLCanvasElement>document.getElementById('EcGauge'); // your canvas element
		var ctx = EcCanvas.getContext('2d');
		ctx.canvas.width = innerWidth;
		ctx.canvas.height = innerHeight;

		this.EcGauge = new Gauge(EcCanvas).setOptions(this.EcOptions); // create sexy gauge!
		this.EcGauge.maxValue = this.maxEc; // set max gauge value
		this.EcGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.EcGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.EcGauge.set(1.6); // set actual value
	}

	initOrpGauge(){
		var OrpCanvas = <HTMLCanvasElement>document.getElementById('OrpGauge'); // your canvas element
		var ctx = OrpCanvas.getContext('2d');
		ctx.canvas.width = innerWidth;
		ctx.canvas.height = innerHeight;

		this.OrpGauge = new Gauge(OrpCanvas).setOptions(this.OrpOptions); // create sexy gauge!
		this.OrpGauge.maxValue = this.maxOrp; // set max gauge value
		this.OrpGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.OrpGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.OrpGauge.set(300); // set actual value
	}	

	getArduinoReading(){

		this.myWebSocketService.getSocket().subscribe(
			(dataFromServer) => {
				//console.log('\nTemp: ' + dataFromServer);
				//console.log('\nprefix char of reading is: ' + dataFromServer[0]);

				var prefix = dataFromServer[0].toLowerCase();
				//console.log("reading prefix is: " + prefix);

				//Update the countdown value on the dashboard every time data from server is received.
				if (this.timeTillReading <= 0) {
					this.timeTillReading = 5;
				}else{
					this.timeTillReading = Math.floor(this.timeTillReading - (this.readingEvery/this.sensorCount)); //4 readings (1 per sensor) every send, so knock off 0.25 for each reading.
				}

				switch (prefix) {
					case "t":
						var temp = dataFromServer.substring(1, );
						//$('#TempValue').text(temp);
						this.TempGauge.set(temp);
						this.currentTemp = temp;

						break;

					case "p":
						var ph = dataFromServer.substring(1, );
						//$('#PhValue').text(ph);
						this.PhGauge.set(ph);
						this.currentPh = ph;
						break;

					case "e":

						var ec = dataFromServer.substring(1, );
						//$('#EcTdsValue').text(ec);
						this.EcGauge.set(ec);
						this.currentEc = ec;
						break;

					case "o":
						var orp = dataFromServer.substring(1, );
						//$('#OrpValue').text(orp);
						this.OrpGauge.set(orp);
						this.currentOrp = orp;
						break;	

					default:
						console.log('Error - Unknown');
						break;
				}
			},
			error => {
				console.log(error);
			},
			() => {
				console.log('Connection Closed!');
				alert('Connection Closed!');
			}		
		);

	}

	async ShowChartDetailView(event:Event){
		var requestedChart = (<HTMLDivElement>event.target).id;

		switch (requestedChart){
			
			case 'TempValue':
			case 'TempGauge':
				$('.chartButton').removeClass('active');
				$('#tempButtonLabel').addClass('active');
				this.selectedChart = 0;
				break;
			case 'PhValue':
			case 'PhGauge':
				$('.chartButton').removeClass('active');
				$('#phButtonLabel').addClass('active');
				this.selectedChart = 1;
				break;

			case 'EcValue':
			case 'EcGauge':
				$('.chartButton').removeClass('active');
				$('#ecButtonLabel').addClass('active');
				this.selectedChart = 2;
				break;

			case 'OrpValue':
			case 'OrpGauge':
				$('.chartButton').removeClass('active');
				$('#orpButtonLabel').addClass('active');
				this.selectedChart = 3;
				break;
		
			default:	
				console.log('Unknown Chart Requested - ' + requestedChart);			
				break;
		}
		console.log("Requested Chart: " + requestedChart);
		console.log("Selected Chart: " + this.selectedChart);
 
		await this.initialiseGraph();
		$('#mask').toggle(); 
		$('#DetailView').toggle();

	}

	CloseOverlay(){
		$('#DetailView').slideToggle();
		$('#mask').slideToggle(); 

		//Destroy the chart, ready for re-use.
		this.myChart.destroy();

	}

	mousedown(event: Event){

		var id = (<HTMLDivElement>(event.target)).id;

		switch(id){
			case "TempValue":
				$('#TempTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
				$('#TempValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
			break;

			case "PhValue":
				$('#PhValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
				$('#PhTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
			break;

			case "EcTdsValue":
				$('#EcTdsValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
				$('#EcTdsTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
			break;

			case "OrpValue":
				$('#OrpTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
				$('#OrpValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0)"
				});
			break;
		}

	}

	mouseup(event: Event){

		var id = (<HTMLDivElement>(event.target)).id;

		switch(id){
			case "TempValue":
				$('#TempTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
				$('#TempValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
			break;

			case "PhValue":
				$('#PhValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
				$('#PhTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
			break;

			case "EcTdsValue":
				$('#EcTdsValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
				$('#EcTdsTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
			break;

			case "OrpValue":
				$('#OrpTitle').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
				$('#OrpValue').css({
					"-webkit-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"-moz-box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)",
					"box-shadow":"10px 10px 5px 0px rgba(0,0,0,0.75)"
				});
			break;
		}

	}


}//END OF COMPONENT
