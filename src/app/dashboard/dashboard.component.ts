import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { DatabaseControllerService } from '../database-controller.service';
import { Gauge } from 'node_modules/gaugeJS/dist/gauge.js';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { GetChartDateService } from '../get-chart-date-service.service';

var Chart = require('chart.js');

const maxTemp: string = '40';
const maxPh:string = '14';
const maxEc:string = '4';
const maxOrp:string = '600';


@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
  })

export class DashboardComponent implements OnInit {

	/*#region PROPERTIES/VARIABLES ETC*/

	defaultPixelsPerDataPoint = 10; //Arbitrary value used to set the width of the graph container/spacing of the readings, based on the screen size. 
	tempPixelsPerDataPoint = this.defaultPixelsPerDataPoint; //Temp version of the above for changing chart width on the fly.

	readingEvery; //This should be the same as the delay() value in the arduino sketch main loop, measured in seconds.
	sensorCount = 3; //Should be four sensors once you have bought them all.
	timeTillReading; //this is the reading bound to the webpage interface that informs the user when the next reading will occur.
	readingCounter = 0; //Increments by 1 every time a reading is received. When the same as sensorCount, reset timeTillReading.

	selectedChart: number = 0;
	arduinoReading: string; //this is the reaading received from the mcu, formatted as prefix (specifies which sensor) + reading.
	TempGauge: Gauge;
	PhGauge: Gauge;
	EcGauge: Gauge;
	OrpGauge: Gauge;

	getEverythingQueryString = "SELECT * FROM ";

	//ARDUINO READING PROPERTIES
	currentTemp: string = "22.65";
	currentPh: string = "6.54"
	currentEc: string = "1.6";
	currentOrp: string = "300";

	myChart = null;
	resizeCount: number;
	charts = ["temperature", "ph", "ec","orp"];
	chartMaxValues = {0:maxTemp, 1:maxPh, 2:maxEc, 3:maxOrp};

  
	TempOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 0.9, // Relative radius
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
		radiusScale: 0.9, // Relative radius
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
		radiusScale: 0.9, // Relative radius
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
		radiusScale: 0.9, // Relative radius
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

	/*#endregion*/

	/*#region FONT AWESOME ICONS */
	magPlusIcon = faSearchPlus;
	magMinusIcon = faSearchMinus;


	/*#endregion*/

	
	constructor(
		private myWebSocketService: WebSocketService, 
		private databaseService: DatabaseControllerService,
		private chartDateService: GetChartDateService) {	}

	ngOnInit(){
		this.getArduinoReading();
	}

	ngAfterViewInit() {
		this.initialiseAllGauges();
	}

	/*#region MAIN METHODS*/

	//Change displayed chart from within the overlay.
	async chartButtonClicked(event){
		//alert("chartButtonClicked event fired!");

		//reset when changing charts.
		this.tempPixelsPerDataPoint = this.defaultPixelsPerDataPoint;

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

			//Time labels for x-axis
			xAxisData = dataArray[0];
			//console.log('xAxisdata count is: ' + xAxisData.length);

			//Sensor reading values for y-axis.
			yAxisData = dataArray[1];	
			//console.log('yAxisdata count is: ' + yAxisData.length);

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

			var rectangleSet = false;
			var chartData = {
				//labels: this.generateLabels(),
				labels: xAxisData,
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
					display: false
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: xAxisTitle,
							fontSize: 20,	
							fontColor: 'black'						
						},
						ticks: {
							beginAtZero: true,
							min: 0,
							fontSize: 12,
							display: true,
							fontColor: 'black'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: yAxisTitle,
							fontSize: 20,	
							fontColor: 'black'						
						},
						ticks: {
							display: true,
							min: 0,
							max: parseInt(this.chartMaxValues[this.selectedChart]),
							fontSize: 12,
							beginAtZero: true,
							fontColor: 'black'
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
					},
					onResize: function(){
						var sourceCanvas = <HTMLCanvasElement>document.getElementById('myChart');
						var targetCanvas = <HTMLCanvasElement>document.getElementById("axis-Test");
						targetCanvas.height = sourceCanvas.height;
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

		}); //returns data for x & y axes, as well as the max value for the y-axis data

	}

	async getDatabaseData() :Promise<any[]>{
		console.log('Enter getDatabaseData().');

		return await new Promise(async (resolve,reject)=>{

			var dataArray = new Array();
			var selectedDate = this.chartDateService.getDatePickerDate();

			var dbResultObserver = await this.databaseService.getData(this.selectedChart, selectedDate);
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
						var time :string = (dbRowsAsJson[row]['time']);
						var reading :string = dbRowsAsJson[row][this.charts[this.selectedChart]];
						//console.log('this.charts[this.selectedChart] is: ' + this.charts[this.selectedChart]);
						//console.log('timeStamp is: ' + timeStamp);
						//console.log('reading is: ' + reading);
						xAxisData.push(time);
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

	getArduinoReading(){

		this.myWebSocketService.getSocket().subscribe(
			(dataFromServer) => {
				//console.log('\nTemp: ' + dataFromServer);
				//console.log('\nprefix char of reading is: ' + dataFromServer[0]);

				var prefix = dataFromServer[0].toLowerCase();
				//console.log("reading prefix is: " + prefix);

				switch (prefix) {
					//This is the first serial data to be received from the setup function in the Arduino sketch
					//that serves to auto-update the timer for informing the user when the next reading will be.
					//Timer interval value is received as a string in milliseconds so /1000 to convert to seconds.
					case '0':
						this.readingEvery = parseInt(dataFromServer.substring(1, ))/1000;
						this.startTimer();
						break;

					case "t":
						var temp = dataFromServer.substring(1, );
						//$('#TempValue').text(temp);
						this.TempGauge.set(temp);
						this.currentTemp = temp;
						this.readingCounter++;
						break;

					case "p":
						var ph = dataFromServer.substring(1, );
						//$('#PhValue').text(ph);
						this.PhGauge.set(ph);
						this.currentPh = ph;
						this.readingCounter++;
						break;

					case "e":

						var ec = dataFromServer.substring(1, );
						//$('#EcTdsValue').text(ec);
						this.EcGauge.set(ec);
						this.currentEc = ec;
						this.readingCounter++;
						break;

					case "o":
						var orp = dataFromServer.substring(1, );
						//$('#OrpValue').text(orp);
						this.OrpGauge.set(orp);
						this.currentOrp = orp;
						this.readingCounter++;
						break;	

					default:
						console.log('Error - Unknown prefix in getArduinoReading() received.');
						break;
				}

				if (this.readingCounter >= this.sensorCount) {
					this.resetReadingCounter();
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

	/*#endregion*/


	/*#region CHART SPECIFIC METHODS*/

	chartZoomIn(event){
		var buttonId = (<HTMLButtonElement>(event.target)).id;		
		console.log('chart zoomed in!');
		console.log(`original positive event target is: ${event.target}`);

		this.tempPixelsPerDataPoint++;
		var newChartWidth = this.calcNewChartWidth(buttonId);
		this.myChart.canvas.parentNode.style.width = newChartWidth;
		//console.log(`New Chart Width: ${newChartWidth}`);	

		//Equalise chart heights to prevent the axis title overlapping incorrectly.
		var axisChart = (<HTMLCanvasElement>document.getElementById("axis-Test")).getContext("2d");
		axisChart.canvas.height = this.myChart.canvas.height; 	
	}

	chartZoomOut(event){
		var buttonId = (<HTMLButtonElement>(event.target)).id;		
		console.log('chart zoomed out!');
		console.log(`original negative event target is: ${event.target}`);
		this.tempPixelsPerDataPoint--;
		var newChartWidth = this.calcNewChartWidth(buttonId);
		this.myChart.canvas.parentNode.style.width = newChartWidth;
		//console.log(`New Chart Width: ${newChartWidth}`);

		//Equalise chart heights to prevent the axis title overlapping incorrectly.
		var axisChart = (<HTMLCanvasElement>document.getElementById("axis-Test")).getContext("2d");
		axisChart.canvas.height = this.myChart.canvas.height; 	
	}

	calcNewChartWidth(buttonId): string{
		console.log(`In calcNewChartWidth(), buttonId is ${buttonId.toString()}`);
		var newWidth = '';
		var dataArrayLength = this.myChart.data.datasets[0].data.length;

		switch (buttonId) {
			case 'magPlusBtn':
				if ((dataArrayLength * this.tempPixelsPerDataPoint) >= $(window).width()) {
					newWidth = `${dataArrayLength * this.tempPixelsPerDataPoint}px`;
					$('#magMinusBtn').prop('disabled',false);

				} else {					
					//If dataArrayLength is too small, tempPixelsPerDataPoint might still be too small too 
					//result in a px value greater than that of chartAreaWrapper, so compute a new value
					//for tempPixelsPerDataPoint.
					var requiredPixelsPerDataPoint = ($(window).width() / dataArrayLength) + 1;

					if (this.tempPixelsPerDataPoint < requiredPixelsPerDataPoint) {
						this.tempPixelsPerDataPoint = requiredPixelsPerDataPoint;
						newWidth = `${dataArrayLength * this.tempPixelsPerDataPoint}px`;
					} else {
						newWidth = `${dataArrayLength * this.tempPixelsPerDataPoint}px`;
					}
					$('#magMinusBtn').prop('disabled',false);

				}
				break;

			case 'magMinusBtn':
				if ((dataArrayLength * this.tempPixelsPerDataPoint) >= $(window).width()) {
					newWidth = `${dataArrayLength * this.tempPixelsPerDataPoint}px`;
				} else {
					newWidth = '100%';
					$('#magMinusBtn').prop('disabled',true);		
				}
				break;	

			default:
				break;
		}

		console.log(`newWidth is ${newWidth}`);
		console.log(`tempPixelsPerDataPoint is ${this.tempPixelsPerDataPoint}`);
		return newWidth;
	}


	/*#endregion */


	/*#region METHODS - DUMMY DATA GENERATION FOR CHART*/

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
	
	/*#endregion*/

	
	/*#region METHODS RELATING TO THE GAUGES*/

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
		this.TempGauge.maxValue = maxTemp; // set max gauge value
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
		this.PhGauge.maxValue = maxPh; // set max gauge value
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
		this.EcGauge.maxValue = maxEc; // set max gauge value
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
		this.OrpGauge.maxValue = maxOrp; // set max gauge value
		this.OrpGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.OrpGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.OrpGauge.set(300); // set actual value
	}	

	/*#endregion*/

	
	/*#region UTILITY METHODS*/

	resetReadingCounter(){
		this.timeTillReading = this.readingEvery;
	}

	setChartAreaWidth(yAxisData){
		if (yAxisData.length >= this.tempPixelsPerDataPoint && ((yAxisData.length * this.tempPixelsPerDataPoint) >= $(window).width())) {
			$('.chartAreaWrapper2').css('width', `${yAxisData.length * this.tempPixelsPerDataPoint}px`);
			$('#magMinusBtn').prop('disabled', false);
		}else{
			$('.chartAreaWrapper2').css('width', '100%');
			$('#magMinusBtn').prop('disabled', true);
		}
	}
	
	startTimer(){

		if (this.readingEvery >= 0) {
			this.timeTillReading = this.readingEvery
			setInterval(()=>{
				if (this.timeTillReading <= 0) {
					this.timeTillReading = this.readingEvery;
				} else {
					this.timeTillReading -= 1;
				}
			}, 1000);
		}else{
			//Error condition - this.readingEvery has not been set yet!!
			console.log('startTimer() called but timeTillReading not yet initialised with a value or has a negative value!');			
		}
	}

	CloseOverlay(){
		$('#DetailView').slideToggle();
		$('#mask').slideToggle(); 

		//Destroy the chart, ready for re-use.
		this.myChart.destroy();

	}

	mousedown(event: Event){

		var id = (<HTMLDivElement>event.target).id;

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

		var id = (<HTMLDivElement>event.target).id;

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

	/*#endregion*/

}//END OF COMPONENT
