function ShowTempDetailView(){
	$('#DetailView').toggle("slide",{direction: 'down'});
}

function ShowPhDetailView(){
	$('#DetailView').css("display", "block");
}

function ShowEcTdsDetailView(){
	$('#DetailView').css("display", "block");
}

function ShowOrpDetailView(){
	$('#DetailView').css("display", "block");
}

function CloseOverlay(){
	$('#DetailView').toggle("slide", {direction: 'down'});
}



function mousedown(id){

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

function mouseup(id){

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

