import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-test',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.scss']
})

export class TestComponent implements OnInit {




	constructor() {}

	ngOnInit(){
  	}

	disableButton(){
		$('#myBtn').attr('disabled', 'true');
		console.log('myBtn disabled!');

	}
	


}//END OF COMPONENT
