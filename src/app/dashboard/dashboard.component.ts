import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { WebSocketService } from '../web-socket.service';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

	selectedChart: number = 0;
	arduinoReading: string;

	constructor(private myWebSocketService: WebSocketService) {

	}

	ngOnInit(){
		this.getArduinoReading();
	}

	ngAfterViewInit() {

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

	

	getArduinoReading(){

		this.myWebSocketService.getSocket().subscribe({
			next: (dataFromServer) => {
				//console.log('\nTemp: ' + dataFromServer);
				//console.log('\nprefix char of reading is: '+dataFromServer[0]);

				switch (dataFromServer[0]) {
					case "t":
						var temp = dataFromServer.substring(1, );
						$('#TempValue').text(temp);
						break;
				
					default:
						break;
				}



			},
			error: console.log,
			complete: () => {}		
		
		});

	}

	ShowChartDetailView(event:Event){
		var requestedChart = (<HTMLDivElement>event.target).id;

		switch ((<HTMLDivElement>event.target).id){
			
			case 'TempValue':
				$('#temp').click();
				break;
			case 'PhValue':
				$('#ph').click();
				break;

			case 'EcTdsValue':
				$('#ec').click();
				break;

			case 'OrpValue':
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
