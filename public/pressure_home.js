const socket = io();

socket.emit('games:mode_update', {
	mode : 'games'
});

var is_imu_connected = false;
var is_pressure_connected = false;

window.onload = function(){ 
	
	document.getElementById("connect_imu").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_imu").value == "off") {
			document.getElementById("connect_imu").value = "connecting";
			document.getElementById("connect_imu").style.background = "#808080";
			document.getElementById("connect_imu").innerHTML = "Conectando...";
			socket.emit('games:connect_imu1');

		// Stop emg_connection
		} else if (document.getElementById("connect_imu").value == "on") {
			document.getElementById("connect_imu").value = "off";
			document.getElementById("connect_imu").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu").style.background = "#4e73df";
			socket.emit('games:disconnect_imu1');

		} else if (document.getElementById("connect_imu").value == "connecting") {
			document.getElementById("connect_imu").value = "off";
			document.getElementById("connect_imu").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu").style.background = "#4e73df";
			socket.emit('games:disconnect_imu1');
		}
	}	
	
	document.getElementById("connect_pressure").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_pressure").value == "off") {
			document.getElementById("connect_pressure").value = "connecting";
			document.getElementById("connect_pressure").style.background = "#808080";
			document.getElementById("connect_pressure").innerHTML = "Conectando...";
			socket.emit('pressure:connect_pressure');

		// Stop emg_connection
		} else if (document.getElementById("connect_pressure").value == "on") {
			document.getElementById("connect_pressure").value = "off";
			document.getElementById("connect_pressure").innerHTML = "Conectar Sensor De Presión";
			document.getElementById("connect_pressure").style.background = "#808080";
			socket.emit('pressure:disconnect_pressure');

		} else if (document.getElementById("connect_pressure").value == "connecting") {
			document.getElementById("connect_pressure").value = "off";
			document.getElementById("connect_pressure").innerHTML = "Conectar Sensor De Presión";
			document.getElementById("connect_pressure").style.background = "#808080";
			socket.emit('pressure:disconnect_pressure');
		}
	}	
	
	document.getElementById("record").onclick = function() {
		socket.emit('monitoring:start');
		document.getElementById("record").disabled = true;
		document.getElementById("stop").disabled = false;
		
	}
	document.getElementById("stop").onclick = function() {
		socket.emit('monitoring:start');
		document.getElementById("record").disabled = false;
		document.getElementById("stop").disabled = true;
		socket.emit('monitoring:stop');
		document.getElementById("save").disabled = false;
		
	}
	document.getElementById("save").onclick = function() {
		socket.emit('pressure:download');
		document.getElementById("save").disabled = true;
		window.open('http://192.168.43.1:3000/downloadpressuresensor');
		
	}
}

socket.on('games:connection_status', (data) => {
	let device= data.device;
	let status= data.status;
	console.log(data);
	if(device == 'imu1'){
		if (status==0){
			console.log("is con")
			//change button color and text;
			document.getElementById("connect_imu").value = "on";
			document.getElementById("connect_imu").innerHTML = "Desconectar IMU";
			document.getElementById("connect_imu").style.background = "#4eb14e";
			is_imu_connected = true
			
			if(is_pressure_connected){
				document.getElementById("record").disabled = false;

			}
		} else {
			console.log("error connection");
			//change button color and text;
			document.getElementById("connect_imu").value = "off";
			document.getElementById("connect_imu").innerHTML = "Conectar IMU";
			document.getElementById("connect_imu").style.background = "#4e73df";
			is_imu_connected = false;
			
			document.getElementById("record").disabled = true;
			document.getElementById("stop").disabled = true;
			document.getElementById("save").disabled = true;
		}

	} else if ( device == 'pressure'){
		if (status == 0){
			console.log("is con")
			//change button color and text;
			document.getElementById("connect_pressure").value = "on";
			document.getElementById("connect_pressure").innerHTML = "Desconectar Sensor de Presion";
			document.getElementById("connect_pressure").style.background = "#4eb14e";
			is_pressure_connected = true;
			if(is_pressure_connected){
				document.getElementById("record").disable=false;
			}
		} else if (status == 1 || status == 2){
			console.log("error connection")
			//change button color and text;
			document.getElementById("connect_pressure").value = "off";
			document.getElementById("connect_pressure").innerHTML = "Conectar Sensor de Presión";
			document.getElementById("connect_pressure").style.background = "#4e73df";
			is_pressure_connected = false;
			
			document.getElementById("record").disabled = true;
			document.getElementById("stop").disabled = true;
			document.getElementById("save").disabled = true;
		}
	}
});


