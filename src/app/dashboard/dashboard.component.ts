import { Component, OnInit, AfterContentInit, AfterContentChecked } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { DatabaseControllerService } from '../services/database-controller.service';
import { Gauge } from 'node_modules/gaugeJS/dist/gauge.js';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import { GetDatePickerService } from '../services/get-chart-date-service.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';

var Chart = require('chart.js');

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
		private datePickerService: GetDatePickerService,
		private router: Router) {	}

	ngOnInit(){

		var isLoggedIn = sessionStorage.getItem('isLoggedIn');
		console.log(`isLoggedIn is: ${isLoggedIn}`);
		if (isLoggedIn == 'false' || isLoggedIn == '' || isLoggedIn == null) {
			this.router.navigate(['']);
		}

		//Request the timer interval value (in seconds).
		this.myWebSocketService.getSocket().next('timerInterval');

		this.getArduinoReading();

		//Get a full list of dates, in order to disable all other dates in the date picker
		//and also to set the initial date that will be retrieved by the datepicker component
		//to set the initial date to be displayed on the datePicker button.
		this.databaseService.getAllDatesFromTableForDatePicker(this.selectedChart, 'date').then((listOfDatesObservable)=>{
			listOfDatesObservable.subscribe((listOfDates)=>{
				//console.log(`In ngAfterViewInit(), listOfDates is: ${listOfDates}`);
				var prefixFreeString: string[] = JSON.parse(listOfDates.substring(2,));
				//console.log(`prefixFreeString is: ${prefixFreeString}`);
				var arrayOfDateStructs = this.convertStringDateArrayToNgbDateStructDateArray(prefixFreeString);
				var initialDateForDatePickerButton = this.convertNgbStructDateToString(arrayOfDateStructs[0]);
				this.datePickerService.setDatePickerDate(initialDateForDatePickerButton);
				this.datePickerService.setCurrentXAxisData(arrayOfDateStructs);
			});
		});	
		
	}

	ngAfterViewInit() {
		this.initialiseAllGauges();

		//Remake the chart based on the change of date specified by the datepicker notification.
		this.datePickerService.datePickerDateSubject.subscribe(async ()=>{
			console.log('datePickerDateSubject notification received!');
			this.myChart.destroy();
			await this.initialiseGraph();
		});

	};

	/*#region MAIN METHODS*/

	//Change displayed chart from within the overlay.
	async chartButtonClicked(event){
		//console.log('Entered chartButtonClicked()!');

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
			this.drawChart(dataArray);
		}); //returns data for x & y axes, as well as the max value for the y-axis data

		await this.getMinMaxDatabaseData().then((minMaxDataArray)=>{
			//do something with the returned min/max datepicker data.
			//console.log(`minMaxDataArray is: ${minMaxDataArray}`);
			this.datePickerService.setMinMaxDates(minMaxDataArray[0], minMaxDataArray[1]);
		});


	}

	async getDatabaseData(): Promise<any[]>{
		console.log('Enter getDatabaseData().');

		return await new Promise(async (resolve,reject)=>{

			var dataArray = new Array();
			var selectedDate = this.datePickerService.getDatePickerDate();
			//var selectedDate = $('#dateSelector').val().toString();
			//alert(`selectedDate is: ${selectedDate}`);

			//Gets Chart data - either all or by given day.
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
				console.log("\ndbRows as json are: " + JSON.stringify(dbRowsAsJson));
				console.log(`dbRowsAsJson.length is: ${arrayContainingJson.length}`);

				var xAxisData = new Array();
				var yAxisData = new Array();

				if(arrayContainingJson.length > 0) {
					for (const row in dbRowsAsJson) {
						if (dbRowsAsJson.hasOwnProperty(row)) {
							//time stamp arrives as format: "1980-02-27T08:23:00.000Z". Replace 'T' with a space and substring to
							//"1980-02-27 08:23:00" format.
							var time :string = (dbRowsAsJson[row]['time']);
							var date :string = (dbRowsAsJson[row]['date']);
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
				}

				resolve(dataArray);

			});

		});


	}

	async getMinMaxDatabaseData(): Promise<any[]>{
		console.log('Enter getMinMaxDatabaseData().');

		return await new Promise(async (resolve,reject)=>{

			//Only gets min/max datepicker dates.
			var minMaxDatePickerDates = await this.databaseService.getChartMinMaxDates(this.selectedChart, 'date');
			minMaxDatePickerDates.subscribe((data)=>{
				//console.log(`minMaxDatePickerDates data is: ${data}`);

				//console.log('\nReturned data in getDatabaseData() is: ' + data);
				var dataIncludingPrefix = JSON.parse(data);
				//console.log('dataIncludingPrefix is: ' + dataIncludingPrefix);
				var prefix = dataIncludingPrefix.substring(0,2);
				//console.log("\nReading prefix from server is: " + prefix);
				var arrayContainingJson = dataIncludingPrefix.substring(2,);
				//console.log("\nArray containing JSON is: " + arrayContainingJson);
				var dbRowsAsJson:JSON = JSON.parse(arrayContainingJson);
				//console.log("\ndbRows as json are: " + JSON.stringify(dbRowsAsJson));

				var minMaxPickerDates = new Array<string>();

				if(arrayContainingJson.length > 0) {
					for (const row in dbRowsAsJson) {
						if (dbRowsAsJson.hasOwnProperty(row)) {
							minMaxPickerDates.push(dbRowsAsJson[row]['Min(date)']);
							minMaxPickerDates.push(dbRowsAsJson[row]['Max(date)']);
						}
					}
				}
				//console.log(`minMaxPickerDates is: ${minMaxPickerDates}`);
				resolve(minMaxPickerDates);
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
						console.log(`timerInterval Data is: ${dataFromServer}`);
						//var stringData = JSON.parse(dataFromServer);
						//console.log(`After parsing, string data from server is: ${stringData}`);
						this.readingEvery = parseInt(dataFromServer.substring(1, ))/1000;
						console.log(`Timer interval prefix received: ${this.readingEvery}s`);
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
				//alert('Connection Closed!');
			}		
		);

	}



	/*#endregion*/


	/*#region CHART SPECIFIC METHODS*/

	drawChart(dataArray){
		console.log('Enter getDatabaseData().then()');

		//graph variables
		var xAxisData = new Array();
		var yAxisData = new Array();
		var xAxisTitle;
		var yAxisTitle;
		var dataSetLabel;

		//console.log('graphFromDb is: ' + dataArray.toString());
		xAxisData = dataArray[0];

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

					var scale = window.devicePixelRatio;                       

					var copyWidth = myChart.scales['y-axis-0'].width - 10;
					var targetCtx = (<HTMLCanvasElement>document.getElementById("axis-Test")).getContext("2d");



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
	}

	chartZoom(event){
		var buttonId = (<HTMLButtonElement>(event.target)).id;	
		
		switch (buttonId) {
			case 'magMinusBtn':
				console.log('chart zoomed out!');
				//console.log(`original negative event target is: ${event.target}`);
				this.tempPixelsPerDataPoint--;
			break;
		
			case 'magPlusBtn':
				console.log('chart zoomed in!');
				//console.log(`original positive event target is: ${event.target}`);
				this.tempPixelsPerDataPoint++;
			break;

			default:
				console.log(`Invalid buttonId in chartZoom(): ${buttonId}`);
			break;
		}
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

	convertStringDateArrayToNgbDateStructDateArray(dateStringArray: string[]): NgbDateStruct[]{

		console.log(`dateStringArray entry count: ${dateStringArray.length}`);
		console.log(`dateStringArray[0] is: ${JSON.stringify(dateStringArray[0])}`);
		var dateStructArray = new Array<NgbDateStruct>();

		var dateArray = new Array<string>();
		dateStringArray.forEach((date)=>{
			var dateItem = date['date'];
			dateArray.push(dateItem);
		});
		var dateSet = new Set(dateArray);

		dateSet.forEach(date => {
			//console.log(`date is: ${date}`);
			var dateItemArray = date.split('-');
			var year = parseInt(dateItemArray[0]);
			var month = parseInt(dateItemArray[1]);
			var day = parseInt(dateItemArray[2]);

			var structDate = {
				year: year,
				month: month,
				day: day
			};

			dateStructArray.push(structDate);
		});


		return dateStructArray;
	};

	convertNgbStructDateToString(date: NgbDateStruct): string{
		//console.log(`In convertNgbStructDateToString(), date is: ${JSON.stringify(date)}`);

		var dateString;

		var year = date.year.toString();
		var month = date.month.toString();
		var day = date.day.toString();

		if (date.month < 10) {
			month = `0${date.month}`;
		}

		if (date.day < 10) {
			day = `0${date.day}`;
		}
		//console.log(`In convertNgbStructDateToString(), dateString is: ${dateString}`);
		dateString = `${day}-${month}-${year}`;

		return dateString;
	}

	extractShortDateFromLongDate(longDateString){
		//console.log('dateString is: ' + dateString);
		var splitStringArray = longDateString.split('-');
		var day = splitStringArray[2];
		var month = splitStringArray[1];
		var year = splitStringArray[0];
		var shortDateString = `${day}-${month}-${year}`;

		return shortDateString;
	}

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
		console.log(`startTimer() started!`);
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

	//#region STATS METHODS

	async getReadingAverages(event){
		console.log('Entered getDailyAverages()');
		await new Promise(async (resolve,reject)=>{

			var dataArray = new Array();
			var timeFrame = <HTMLLinkElement>event.target.id;

			//Gets Chart data - either all or by given day - for stats puposes.
			var dbResultObserver = await this.databaseService.getData(this.selectedChart);
			dbResultObserver.subscribe((data)=>{

				//console.log('\nReturned data in getDatabaseData() is: ' + data);
				var dataIncludingPrefix = data;
				//console.log('dataIncludingPrefix is: ' + dataIncludingPrefix);
				var prefix = dataIncludingPrefix.substring(0,2);
				//console.log("\nReading prefix from server is: " + prefix);
				var arrayContainingJson = dataIncludingPrefix.substring(2,);
				//console.log("\nArray containing JSON is: " + arrayContainingJson);
				var dbRowsAsJson:JSON = JSON.parse(arrayContainingJson);
				//console.log("\ndbRows as json are: " + JSON.stringify(dbRowsAsJson));
				//console.log(`dbRowsAsJson.length is: ${arrayContainingJson.length}`);

				var xAxisData = new Array();
				var yAxisData = new Array();

				if(arrayContainingJson.length > 0) {
					for (const row in dbRowsAsJson) {
						if (dbRowsAsJson.hasOwnProperty(row)) {
							//time stamp arrives as format: "1980-02-27T08:23:00.000Z". 
							var date :string = this.extractShortDateFromLongDate((dbRowsAsJson[row]['date']).substring(0,10));
							var reading :string = dbRowsAsJson[row][this.charts[this.selectedChart]];
							xAxisData.push(date);
							yAxisData.push(reading);	
						}
					}
					//console.log(`xAxisData is: ${xAxisData.toString()} containing ${xAxisData.length} entries`);
					//console.log(`yAxisData is: ${yAxisData.toString()} containing ${yAxisData.length} entries`);
				}

				dataArray = this.extractAverages(timeFrame, xAxisData, yAxisData);						
				
				//clear the chart before drawing it.
				this.myChart.destroy();
				this.drawChart(dataArray);
			});


		});
	}

	extractAverages(timeFrame, xAxisData, yAxisData): any[]{
		console.log(`In extractAverages(), xAxisData is: ${xAxisData}`);

		var uniqueXTotalY = {};
		var dateOccurrences = {};
		var XtoYvalAverages = {};
		var dataArray = new Array();

		//Time Frame variables.
		var currentDate: Date = null;
		var timeAheadDate: Date = null;
		var previousDate: Date = null;
		var currentMonth: number = null;
		var previousMonth: number = null;
		var nextMonth: number = null;

		console.log(`In extractAverages(): \ntimeFrame is: ${timeFrame} \nxAxisData.length is ${xAxisData.length} and \nyAxisData.length is: ${yAxisData.length} `);
		console.log(`xAxisData[0] is: ${xAxisData[0]}`);

		switch (timeFrame) {
			case 'daily':
				//Once the x and y axis arrays have been populated, calculate the DAILY averages.
				for (let i = 0; i < xAxisData.length; i++) {
					if (!uniqueXTotalY[xAxisData[i]]) {
						uniqueXTotalY[xAxisData[i]] = yAxisData[i];
						dateOccurrences[xAxisData[i]] = 1;
					}else{
						uniqueXTotalY[xAxisData[i]] += yAxisData[i];
						dateOccurrences[xAxisData[i]] += 1;
					}
				}

				//populate XtoYvalAverages dictionary, which is a dict of date:avg reading.
				for (const key in uniqueXTotalY) {
					if (uniqueXTotalY.hasOwnProperty(key)) {
						var avg = uniqueXTotalY[key]/dateOccurrences[key];
						XtoYvalAverages[key] = avg;						
					}
				}

				xAxisData = Object.keys(XtoYvalAverages);
				yAxisData = Object.values(XtoYvalAverages);

				dataArray = [xAxisData,yAxisData];
				
			break;
		
			case 'weekly':
				//Once the x and y axis arrays have been populated, calculate the DAILY averages.
				for (let i = 0; i < xAxisData.length; i++) {
					//console.log(`xAxisData is: ${xAxisData}`);

					//console.log(`at this.getDateFromString(xAxisData[i]), xAxisData[i] is: ${xAxisData[i]}`);
					//This is always set to the current iteration.
					currentDate = this.getDateFromString(xAxisData[i]); 

					//previousDate is only set here once uniqueXTotalY has been given an initial entry
					//ergo if previousDate == null, it is the first iteration.
					if (previousDate != null) {
						previousDate = this.getLastUniqueDate(uniqueXTotalY);
					}else{
						timeAheadDate = this.getTimeAheadDate(timeFrame, xAxisData, previousDate);
					}
					console.log(`previousDate is: ${previousDate}`);
					console.log(`currentDate is: ${currentDate}`);
					console.log(`timeAheadDate is: ${timeAheadDate}`);
					console.log(`xAxisData[i] is: ${xAxisData[i]}`);

					if (previousDate != null && (currentDate >= previousDate) && (currentDate < timeAheadDate)) {
						console.log(`currentDate is in the middle!`);
						var lastUniqueDateString = this.getLastUniqueDateString(uniqueXTotalY);
						uniqueXTotalY[lastUniqueDateString] += yAxisData[i];
						dateOccurrences[lastUniqueDateString] += 1;
					}else{
						console.log(`currentDate is NOT in the middle or a first occurrence!`);
						uniqueXTotalY[xAxisData[i]] = yAxisData[i];
						dateOccurrences[xAxisData[i]] = 1;

						//This sets the initial value of previousDate, based on the last entry in uniqueXTotalY.
						previousDate = this.getLastUniqueDate(uniqueXTotalY);

						//This sets the subsequent values of timeAheadDate.
						timeAheadDate = this.getTimeAheadDate(timeFrame, xAxisData, previousDate);
					}
				}
				console.log(`uniqueXTotalY: ${JSON.stringify(uniqueXTotalY)}`);	


				//populate XtoYvalAverages dictionary, which is a dict of date:avg reading.
				for (const key in uniqueXTotalY) {
					if (uniqueXTotalY.hasOwnProperty(key)) {
						var avg = uniqueXTotalY[key]/dateOccurrences[key];
						XtoYvalAverages[key] = avg;	
					}
				}
				//console.log(`XtoYvalAverages: ${JSON.stringify(XtoYvalAverages)}`);	

				xAxisData = Object.keys(XtoYvalAverages);
				yAxisData = Object.values(XtoYvalAverages);


				console.log(`Weekly Avg x-Data: \n${xAxisData}`);
				dataArray = [xAxisData,yAxisData];

			break;

			case 'monthly':
				//Once the x and y axis arrays have been populated, calculate the DAILY averages.
				for (let i = 0; i < xAxisData.length; i++) {
					//console.log(`xAxisData is: ${xAxisData}`);

					//console.log(`at this.getDateFromString(xAxisData[i]), xAxisData[i] is: ${xAxisData[i]}`);
					//This is always set to the current iteration.
					currentDate = this.getDateFromString(xAxisData[i]); 
					currentMonth = new Date(xAxisData[0]).getMonth();
					nextMonth = currentMonth + 1;

					//previousMonth is only set here once uniqueXTotalY has been given an initial entry
					//ergo if previousMonth == null, it is the first iteration.
					if (previousMonth != null) {
						previousMonth = this.getLastUniqueDate(uniqueXTotalY).getMonth();
					}else{
						previousMonth = currentMonth;
					}
					//console.log(`previousDate is: ${previousDate}`);
					console.log(`currentDate is: ${currentDate}`);
					//console.log(`timeAheadDate is: ${timeAheadDate}`);
					console.log(`xAxisData[i] is: ${xAxisData[i]}`);

					if (currentDate.getMonth() == currentMonth) {
						console.log(`Still in the same month!`);
						var lastUniqueMonth = this.getLastUniqueDate(uniqueXTotalY).getMonth();
						var lastUniqueMonthString = months[lastUniqueMonth];
						uniqueXTotalY[lastUniqueMonthString] += yAxisData[i];
						dateOccurrences[lastUniqueMonthString] += 1;
					}else{
						console.log(`Different month or first occurrence!`);
						currentMonth = currentDate.getMonth();
						uniqueXTotalY[months[currentMonth]] = yAxisData[i];
						dateOccurrences[months[currentMonth]] = 1;

						//This sets the initial value of previousDate, based on the last entry in uniqueXTotalY.
						previousMonth = currentMonth - 1;

						//This sets the subsequent values of timeAheadDate.
						nextMonth = currentMonth + 1;
					}
				}
				console.log(`uniqueXTotalY: ${JSON.stringify(uniqueXTotalY)}`);	


				//populate XtoYvalAverages dictionary, which is a dict of date:avg reading.
				for (const key in uniqueXTotalY) {
					if (uniqueXTotalY.hasOwnProperty(key)) {
						var avg = uniqueXTotalY[key]/dateOccurrences[key];
						XtoYvalAverages[key] = avg;	
					}
				}
				//console.log(`XtoYvalAverages: ${JSON.stringify(XtoYvalAverages)}`);	

				xAxisData = Object.keys(XtoYvalAverages);
				yAxisData = Object.values(XtoYvalAverages);


				console.log(`Weekly Avg x-Data: \n${xAxisData}`);
				dataArray = [xAxisData,yAxisData];
		
			break;

			default:
				console.log(`Unknown timeFrame received in extractAverages(): ${timeFrame}`);
			break;
		}

		return dataArray;

	}

	getTimeAheadDate(timeFrame, xAxisData, previousDate): Date{
		var timeAheadDate;

		if (previousDate != null) {
			console.log(`If previousDate is NOT null...`);
			if (timeFrame == 'weekly') {
				timeAheadDate = new Date(previousDate.getTime() + (6 * 86400000));
				console.log(`weekly timeAheadDate is ${timeAheadDate} from previousDate: ${JSON.stringify(previousDate)}`);
			} else {
				timeAheadDate = new Date(previousDate.getMonth() + 1);	
				console.log(`monthly timeAheadDate is ${timeAheadDate} from previousDate: ${JSON.stringify(previousDate)}`);
			}
		} else {
			console.log(`If previousDate is null...`);
			if (timeFrame == 'weekly') {
				//This sets the initial value of timeAheadDate on the first iteration in a 
				//WEEKLY context.
				timeAheadDate = new Date(this.getDateFromString(xAxisData[0]).getTime() + (6 * 86400000));							
				console.log(`weekly timeAheadDate is ${timeAheadDate} from xAxisData[0]: ${xAxisData[0]}`);
			} else {
				//This sets the initial value of timeAheadDate on the first iteration in a 
				//MONTHLY context.
				timeAheadDate = new Date(this.getDateFromString(xAxisData[0]).getMonth() + 1);
				console.log(`monthly timeAheadDate is ${timeAheadDate} from xAxisData[0]: ${xAxisData[0]}`);	
			}			
		}

		return timeAheadDate;
	}

	getLastUniqueDateString(uniqueXTotalY){
		//console.log(`uniqueXTotalY in getLastUniqueDateString() is:\n${JSON.stringify(uniqueXTotalY)}`);
		var arrayOfUniqueDateKeys = Object.keys(uniqueXTotalY);
		var lastUniqueDateIndex = arrayOfUniqueDateKeys.length - 1;
		var lastUniqueDate = arrayOfUniqueDateKeys[lastUniqueDateIndex];

		return lastUniqueDate;
	}

	getLastUniqueDate(uniqueXTotalY): Date{
		var arrayOfUniqueDateKeys = Object.keys(uniqueXTotalY);
		var lastUniqueDateIndex = arrayOfUniqueDateKeys.length - 1;
		var lastUniqueDate = arrayOfUniqueDateKeys[lastUniqueDateIndex];
		var previousDate = this.getDateFromString(lastUniqueDate);

		return previousDate;
	}

	getDateFromString(date): Date{
		console.log(`in getDateFromString(), date is: ${date}`);
		var dateSectionArray = date.split('-');
		var day = dateSectionArray[0];
		var month = dateSectionArray[1];
		var year = dateSectionArray[2];

		return new Date(`${year}-${month}-${day}`);

	}

	extractUniqueDateSection(dateSection, datesArray): [string]{
		var dateSectionArray;
		var nextWeekDate: Date;
		var nextMonthDate: Date;

		switch (dateSection) {
			case 'w':
				for (const date in datesArray) {
					if (datesArray.hasOwnProperty(date)) {
						var sections = date.split('-');

						
					}
				}
				
				break;

			case 'm':
				for (const date in datesArray) {
					if (datesArray.hasOwnProperty(date)) {
						var sections = date.split('-');
						var month = sections[1];
						
					}
				}
				break;
		
			default:
				console.log(`Unknown dateSection received in extractUniqueDateSection(): ${dateSection}`);
				break;
		}





		return dateSectionArray;
	}




	//#endregion




}//END OF COMPONENT
