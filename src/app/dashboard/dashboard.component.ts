import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { WebSocketService } from '../web-socket.service';
import { DatabaseControllerService } from '../database-controller.service';
import { Gauge } from 'node_modules/gaugeJS/dist/gauge.js';
import { resolve } from 'dns';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
  })

export class DashboardComponent implements OnInit {

	selectedChart: number = 0;
	arduinoReading: string;
	TempGauge: Gauge;
	PhGauge: Gauge;
	EcGauge: Gauge;
	OrpGauge: Gauge;

	myChart: Chart;

	charts = ["temperature", "ph", "ec","orp"];

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

  
	TempOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 1, // Relative radius
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
		font: "2em sans-serif",  // Specifies font
		labels: [0,10,20,30,40],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	PhOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 1, // Relative radius
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
		font: "2em sans-serif",  // Specifies font
		labels: [0,2,4,6,8,10,12,14],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	EcOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 1, // Relative radius
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
		font: "2em sans-serif",  // Specifies font
		labels: [0,1,2,3,4],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	OrpOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.2, // The line thickness
		radiusScale: 1, // Relative radius
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
		font: "2em sans-serif",  // Specifies font
		labels: [0,100,200,300,400,500,600],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	constructor(private myWebSocketService: WebSocketService, private databaseService: DatabaseControllerService) {}

	ngOnInit(){
    	this.getArduinoReading();
  	}

	ngAfterViewInit() {
		this.initialiseAllGauges();
	}
  
	async initialiseGraph() {
		console.log('Enter initialiseGraph().');
		var canvas = <HTMLCanvasElement>document.getElementById('myChart');
		var ctx = canvas.getContext('2d');

		await this.getDatabaseData().then((dataArray)=>{

			console.log('Enter getDatabaseData().then()');

			//graph variables
			var xAxisData = new Array();
			var yAxisData = new Array();
			var xAxisTitle;
			var yAxisTitle;
			var dataSetLabel;

			console.log('graphFromDb is: ' + dataArray.toString());

			xAxisData = dataArray[0];
			yAxisData = dataArray[1];

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

			this.myChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: xAxisData,
					datasets: [{
						label: dataSetLabel,
						data: yAxisData,
						fill: false,
						borderColor: 'green'
					}]
				},
				options: {				
					scales: {
						yAxes: [{
							scaleLabel: {
								display: true,
								labelString: yAxisTitle,
								fontSize: 20
							},
							ticks: {
								beginAtZero: true,
								min: 0,
							}
						}],
						xAxes: [{
							scaleLabel: {
								display: true,
								labelString: xAxisTitle,
								fontSize: 20
							},
							ticks: {
								beginAtZero: true,
								min: 0,
							}
						}]
					}
				}
			});	

		}); //returns data for x & y axes, as well as the max value for the y-axis data

	}

	async getDatabaseData() :Promise<any[]>{
		console.log('Enter getDatabaseData().');

		return await new Promise(async (resolve,reject)=>{

			var dataArray = new Array();

			var dbResultObserver = await this.databaseService.getData(this.selectedChart);
			dbResultObserver.subscribe((data)=>{

				//console.log('\nReturned data in getDatabaseData() is: ' + data);
				var dataIncludingPrefix = JSON.parse(data);
				console.log('dataIncludingPrefix is: ' + dataIncludingPrefix);
				var prefix = dataIncludingPrefix.substring(0,2);
				console.log("\nReading prefix from server is: " + prefix);
				var arrayContainingJson = dataIncludingPrefix.substring(2,);
				console.log("\nArray containing JSON is: " + arrayContainingJson);
				var dbRowsAsJson:JSON = JSON.parse(arrayContainingJson);
				console.log("\ndbRows as json are: " + JSON.stringify(dbRowsAsJson));
				
				var xAxisData = new Array();
				var yAxisData = new Array();

				for (const row in dbRowsAsJson) {
					if (dbRowsAsJson.hasOwnProperty(row)) {
						//time stamp arrives as format: "1980-02-27T08:23:00.000Z". Replace 'T' with a space and substring to
						//"1980-02-27 08:23:00" format.
						var timeStamp :string = (dbRowsAsJson[row]['timestamp']).replace('T',' ').substring(0,19);
						var reading :string = dbRowsAsJson[row][this.charts[this.selectedChart]];
						console.log('this.charts[this.selectedChart] is: ' + this.charts[this.selectedChart]);
						console.log('timeStamp is: ' + timeStamp);
						console.log('reading is: ' + reading);
						xAxisData.push(timeStamp);
						yAxisData.push(reading);						
					}
				}
				console.log('xAxisData is: ' + xAxisData.toString());
				console.log('yAxisData is: ' + yAxisData.toString());

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
		var TempCanvas = document.getElementById('TempGauge'); // your canvas element
		this.TempGauge = new Gauge(TempCanvas).setOptions(this.TempOptions); // create sexy gauge!
		this.TempGauge.maxValue = this.maxTemp; // set max gauge value
		this.TempGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.TempGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.TempGauge.set(22); // set actual value
	}

	initPhGauge(){
		var PhCanvas = document.getElementById('PhGauge'); // your canvas element
		this.PhGauge = new Gauge(PhCanvas).setOptions(this.PhOptions); // create sexy gauge!
		this.PhGauge.maxValue = this.maxPh; // set max gauge value
		this.PhGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.PhGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.PhGauge.set(6.5); // set actual value
	}

	initEcGauge(){
		var EcCanvas = document.getElementById('EcGauge'); // your canvas element
		this.EcGauge = new Gauge(EcCanvas).setOptions(this.EcOptions); // create sexy gauge!
		this.EcGauge.maxValue = this.maxEc; // set max gauge value
		this.EcGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.EcGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.EcGauge.set(1.6); // set actual value
	}

	initOrpGauge(){
		var OrpCanvas = document.getElementById('OrpGauge'); // your canvas element
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
				$('#temp').click();
				this.selectedChart = 0;
				break;
			case 'PhValue':
			case 'PhGauge':
				$('#ph').click();
				this.selectedChart = 1;
				break;

			case 'EcValue':
			case 'EcGauge':
				$('#ec').click();
				this.selectedChart = 2;
				break;

			case 'OrpValue':
			case 'OrpGauge':
				$('#orp').click();
				this.selectedChart = 3;
				break;
		
			default:	
				console.log('Unknown Chart Requested - ' + requestedChart);			
				break;
		}
		console.log("Requested Chart: " + requestedChart);
		console.log("Selected Chart: " + this.selectedChart);


		await this.initialiseGraph();
		$('#mask').slideToggle(); 
		$('#DetailView').slideToggle(); 

	}

	CloseOverlay(){
		$('#DetailView').slideToggle();
		$('#mask').slideToggle(); 

		this.myChart.destroy();

		//Remove data from Chart.
		// this.myChart.data.labels.pop();
		// this.myChart.data.datasets.forEach((dataset) => {
		// 	dataset.data.pop();
		// });
		// this.myChart.update();
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
