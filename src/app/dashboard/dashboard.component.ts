import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { WebSocketService } from '../web-socket.service';
import { Gauge } from 'node_modules/gaugeJS/dist/gauge.js';

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
	currentTemp: string;
	currentPh: string;
	currentEc: string;
	currentOrp: string;

  
	TempOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.3, // The line thickness
		radiusScale: 1, // Relative radius
		pointer: {
		length: 0.6, // // Relative to gauge radius
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
		font: "10px sans-serif",  // Specifies font
		labels: [0,10,20,30,40],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	PhOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.3, // The line thickness
		radiusScale: 1, // Relative radius
		pointer: {
		length: 0.6, // // Relative to gauge radius
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
		{strokeStyle: "#F03E3E", min: 0, max: 5.5}, // Red
		{strokeStyle: "#30B32D", min: 5.5, max: 7}, // Green
		{strokeStyle: "#F03E3E", min: 7, max: 14}, // Red
		],
		staticLabels: {
		font: "10px sans-serif",  // Specifies font
		labels: [0,2,4,6,8,10,12,14],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	EcOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.3, // The line thickness
		radiusScale: 1, // Relative radius
		pointer: {
		length: 0.6, // // Relative to gauge radius
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
		font: "10px sans-serif",  // Specifies font
		labels: [0,1,2,3,4],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	OrpOptions = {
		angle: 0, // The span of the gauge arc
		lineWidth: 0.3, // The line thickness
		radiusScale: 1, // Relative radius
		pointer: {
		length: 0.6, // // Relative to gauge radius
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
		font: "10px sans-serif",  // Specifies font
		labels: [0,100,200,300,400,500,600],  // Print labels at these values
		color: "#000000",  // Optional: Label text color
		fractionDigits: 0  // Optional: Numerical precision. 0=round off.
		}
		
	};

	constructor(private myWebSocketService: WebSocketService) {}

	ngOnInit(){
    	this.getArduinoReading();
  	}

	ngAfterViewInit() {

    this.initTempGauge();
    this.initPhGauge();
    this.initEcGauge();
    this.initOrpGauge();

		// Our labels along the x-axis
		var years = [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050];
		// For drawing the lines
		var africa = [86,114,106,106,107,111,133,221,783,2478];
		var asia = [282,350,411,502,635,809,947,1402,3700,5267];
		var europe = [168,170,178,190,203,276,408,547,675,734];
		var latinAmerica = [40,20,10,16,24,38,74,167,508,784];
		var northAmerica = [6,3,2,2,7,26,82,172,312,433];

		var canvas = <HTMLCanvasElement> document.getElementById('myChart');
		var ctx = canvas.getContext('2d');

		console.log('ctx is ' + ctx);
				
		var myChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
				datasets: [{
					label: '# of Votes',
					data: [12, 19, 3, 5, 2, 3],
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		})
	}
  
	initTempGauge(){
		var TempCanvas = document.getElementById('TempGauge'); // your canvas element
		this.TempGauge = new Gauge(TempCanvas).setOptions(this.TempOptions); // create sexy gauge!
		this.TempGauge.maxValue = 40; // set max gauge value
		this.TempGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.TempGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.TempGauge.set(22); // set actual value
	}

	initPhGauge(){
		var PhCanvas = document.getElementById('PhGauge'); // your canvas element
		this.PhGauge = new Gauge(PhCanvas).setOptions(this.PhOptions); // create sexy gauge!
		this.PhGauge.maxValue = 14; // set max gauge value
		this.PhGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.PhGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.PhGauge.set(6.5); // set actual value
	}

	initEcGauge(){
		var EcCanvas = document.getElementById('EcGauge'); // your canvas element
		this.EcGauge = new Gauge(EcCanvas).setOptions(this.EcOptions); // create sexy gauge!
		this.EcGauge.maxValue = 4; // set max gauge value
		this.EcGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.EcGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.EcGauge.set(1.6); // set actual value
	}

	initOrpGauge(){
		var OrpCanvas = document.getElementById('OrpGauge'); // your canvas element
		this.OrpGauge = new Gauge(OrpCanvas).setOptions(this.OrpOptions); // create sexy gauge!
		this.OrpGauge.maxValue = 600; // set max gauge value
		this.OrpGauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
		this.OrpGauge.animationSpeed = 1; // set animation speed (32 is default value)
		this.OrpGauge.set(300); // set actual value
	}	

	getArduinoReading(){

		this.myWebSocketService.getSocket().subscribe(
			(dataFromServer) => {
				//console.log('\nTemp: ' + dataFromServer);
				//console.log('\nprefix char of reading is: '+dataFromServer[0]);

				var prefix = dataFromServer[0].toLowerCase();
				console.log("reading prefix is: " + prefix);

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

	ShowChartDetailView(event:Event){
		var requestedChart = (<HTMLDivElement>event.target).id;

		console.log("Requested Chart: " + requestedChart);

		switch ((<HTMLDivElement>event.target).id){
			
			case 'TempValue':
			case 'TempGauge':
				$('#temp').click();
				break;
			case 'PhValue':
			case 'PhGauge':
				$('#ph').click();
				break;

			case 'EcValue':
			case 'EcGauge':
				$('#ec').click();
				break;

			case 'OrpValue':
			case 'OrpGauge':
				$('#orp').click();
				break;
		
			default:	
				console.log('Unknown Chart Requested - ' + requestedChart);			
				break;
		}
		$('#mask').slideToggle(); 
		$('#DetailView').slideToggle(); 

	}

	CloseOverlay(){
		$('#DetailView').slideToggle();
		$('#mask').slideToggle(); 
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
