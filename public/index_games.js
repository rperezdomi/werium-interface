const socket = io();

var is_sensor_connected = false;
var sensor_connection_failed = false;

socket.emit('games:refreshlist');

socket.on('games:datos_usuarios',function(datapatient){
	console.log("received data usuarios");
	let patient_select = [];
    for (i = 0; i < datapatient.length; i++){
        let patient = datapatient[i].nombre_usuario + " " + datapatient[i].apellido_usuario;
        patient_select.push(patient);  
    }

    for(var i in patient_select)
    { 
        document.getElementById("patients-list").innerHTML += "<option value='"+patient_select[i]+"'>"+patient_select[i]+"</option>"; 
    }
})

// Trigger modal

$( document ).ready( function() {
	$("#myModal").modal('show');
	$('.modal-backdrop').appendTo('.modal_area');
}); 

// Prevent disapearing 
$('#myModal').modal({
	backdrop: 'static',
	keyboard: false
})
	
window.onload = function(){ 
	
	// Updates the therapist and patient name according to the selected names in the "login" popup.
    document.getElementById("login_therapist_patient").onclick = function() {
        if  (document.getElementById("patients-list").value == "no_choose") {                        
                if (document.getElementById("patients-list").value == "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = "Selecciona un usuario o registra uno nuevo en la base de datos."
                } 
                if (document.getElementById("patients-list").value != "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = ""
                } 
        } else {
            var patient_name = document.getElementById("patients-list");
            document.getElementById("patient-name").innerHTML = patient_name.value;

            $('#myModal').modal('hide');
            console.log(document.getElementById("patients-list").value);
            socket.emit('games:get_user_info', {
                patient_name: document.getElementById("patients-list").value
            })
        }        
    };
    
    
	socket.emit('games:mode_update', {
		mode : 'games'
		}
	);

	socket.on('games:connection_status', (data) => {
		let device= data.device;
		let status= data.status;
		console.log(data);
		if(device == 'imu1'){
			if (status==0){
				console.log("is con")
				//change button color and text;
				sensor_connection_failed = false;
				document.getElementById("connect_sensor").value = "on";
				document.getElementById("connect_sensor").innerHTML = "Desconectar Sensor";
				document.getElementById("connect_sensor").style.background = "#4eb14e";
				is_sensor_connected = true
			} else {
				console.log("error connection");
				sensor_connection_failed = true;
				//change button color and text;
				document.getElementById("connect_sensor").value = "off";
				document.getElementById("connect_sensor").innerHTML = "Re-Conectar Sensor";
				document.getElementById("connect_sensor").style.background = "#eb0a0a";
				is_sensor_connected = false;
			}

		}
	}); 
		
	document.getElementById("connect_sensor").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_sensor").value == "off") {
			document.getElementById("connect_sensor").value = "connecting";
			document.getElementById("connect_sensor").style.background = "#808080";
			document.getElementById("connect_sensor").innerHTML = "Conectando...";
			socket.emit('games:connect_imu1');

		// Stop emg_connection
		} else if (document.getElementById("connect_sensor").value == "on") {
			document.getElementById("connect_sensor").value = "off";
			document.getElementById("connect_sensor").innerHTML = "Conectar Sensor";
			document.getElementById("connect_sensor").style.background = "#808080";
			socket.emit('games:disconnect_imu1');

		} else if (document.getElementById("connect_sensor").value == "connecting") {
			document.getElementById("connect_sensor").value = "off";
			document.getElementById("connect_sensor").innerHTML = "Conectar Sensor";
			document.getElementById("connect_sensor").style.background = "#808080";
			socket.emit('games:disconnect_imu1');
		}
	}	
	
	document.getElementById("btn_inicio").onclick = function() {
		if(is_sensor_connected){
			socket.emit('games:disconnect_imu1');
			// Redirect to the therapy monitoring window
			location.replace("index.html");
		}
	}
	
	document.getElementById("btn_juegos").onclick = function() {
		if(is_sensor_connected){
			socket.emit('games:disconnect_imu1');
			// Redirect to the therapy monitoring window
			location.replace("index_games.html");
		}
	}
	
	document.getElementById("btn_usuarios").onclick = function() {
		if(is_sensor_connected){
			socket.emit('games:disconnect_imu1');
			// Redirect to the therapy monitoring window
			location.replace("users_games.html");
		}
	}

}

