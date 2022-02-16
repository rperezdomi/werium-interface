const socket = io();

/************************************
 Play audio when wrong head position
*************************************/
// Play Stop Audio 
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
// get the audio element
const atleti_audioElement = document.getElementById('atleti_audio');
const madrid_audioElement = document.getElementById('madrid_audio');
const barcelona_audioElement = document.getElementById('barcelona_audio');
var audioElement = atleti_audioElement
// select our play button
const playButton = document.getElementById('music');
var track = audioContext.createMediaElementSource(audioElement);

//** Global variables **//
var THERAPY_MONITOR_GOTO_LINK;

// SWalker variables 
var rom_right;
var rom_left;
var load;
var is_swalker_connected = false;
var patient_weight = 1;

// vars used to define the gait cycle
var found_right_heel = false;
var found_left_heel = false;
var min_left_value = 0;
var min_right_value = 0;
var current_step = 0;
var step_left = 0;

// Therapy variables
var is_dataRecorded = false;
var therapy_started = false;
var therapy_reestart = false;
var numberElements_right;
var numberElements_left;

// EMG variables
var emg_enabled = false
var is_muscle_activated = [ false, false, false, false, false, false, false, false]
var max_amplitude_value = [0,0,0,0,0,0,0,0]
var emg = [0,0,0,0,0,0,0,0];
var threshold_errors = [4, 4, 4, 4, 4, 4, 4, 4];    // random code higher than 0
var threshold_values = [0,0,0,0,0,0,0,0];
var binary_activation_values = [0,0,0,0,0,0,0,0];
var max_amplitude_value = [0,0,0,0,0,0,0,0];
var normalized_value = 0
var y_activation_values = [40, 20, 0, -20, 40, 20, 0, -20];
var hidden_emg = true;
var currentColor;
var currentWidth;

// IMUS variables
//var imus_enabled = false;

// Gait variables
var count_traction = 0;
var flag_stp = true;
var new_step = false;
var numberElements = 100;

//** HTML interaction **//
window.onload = function() {
	////////////////
	//** Charts **//
	////////////////
	// Charts configuration
	//Configuration variables

	//Globals
	var updateCounter_right = 0;
	var updateCounter_left = 0;
	//var updateCount = 0;

	// Chart Objects
	// Joint objects
	var ctxrhip = document.getElementById('r_hip_chart').getContext('2d');
	var ctxlhip = document.getElementById('l_hip_chart').getContext('2d');
	//var ctxrknee = document.getElementById('r_knee_chart').getContext('2d');
	//var ctxlknee = document.getElementById('l_knee_chart').getContext('2d');
	// Joint charts sizes:
	ctxrhip.canvas.height = 340;
	ctxlhip.canvas.height = 340;
	//ctxrknee.canvas.height = 340;
	//ctxlknee.canvas.height = 340;

	//*********************************//
	//** JOINT CHARTS CONFIGURATION  **//
	//*********************************//
	var commonJointsOptions = {
		font: {
			size: 16
		},
		scales: {
			xAxes: [{
				type: 'time',
    			time: {
					parser: 'mm-ss-SSS',
        			tooltipFormat: 'HH:mm',
        			displayFormats: {
            			millisecond: 'mm:ss.SSS',
            			second: 'mm:ss',
            			minute: 'mm'
        			}
    			},
				scaleLabel: {
					fontSize: 18,
					display: true,
					labelString: 'Tiempo (s)'
				},
				ticks: {
					fontSize: 18,
					autoSkip: true,
					sampleSize: 5,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				ticks: {
                                        display: true,
					max: 50,    // maximum will be 70, unless there is a lower value.
					min: -30    // minimum will be -10, unless there is a lower value.
                                        
				},
				scaleLabel: {
                                        
					display: true,
					labelString: 'Grados (º)'
				}
			}]
		},
		
		maintainAspectRatio: false,
		//showLines: false, // disable for a single dataset
		animation: {
			duration: 0 // general animation time
		},
		elements: {
			line: {
				tension: 0.1 // disables bezier curves
			}
		}
	};
	// Joint instances
	var ctxrhipInstance = new Chart(ctxrhip, {
		type: 'line',
		data: {
			datasets: [{label: 'ROM',
				data: 0,
				fill: false,
				hidden: true,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointBorderWidth: [],
				pointStyle: 'line'
			},{
				label: '[S1] Recto Femoral',			// S1: Recto femoral
				data: 0,
				fill: false,
				borderWidth: 1.5,
				hidden:true,
				borderColor:'#14540d', 
				pointBorderWidth: [1.5],
				pointBorderColor: ['#14540d'],
				pointBackgroundColor: ['#14540d']

			},{
				label: '[S2] Biceps Femoral',					// S2: isquitibial
				data: 0,
				fill: false,
				borderWidth: 1.5,
				hidden:true,
				borderColor:'#4B0082',
				pointBorderWidth: [1.5],
				pointBorderColor: ['#4B0082'],
				pointBackgroundColor: ['#4B0082']
			}]
		},
		options: Object.assign({}, commonJointsOptions)		
	});

	var ctxlhipInstance = new Chart(ctxlhip, {
		type: 'line',
		data: {
			datasets: [{
				label: 'ROM',
				data: 0,
				hidden: true,
				fill: false,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointBorderWidth: [],
				pointStyle: 'line'
			},{
				label: '[S5] Recto Femoral',			// S5: Recto femoral
				data: 0,
				fill: false,
				borderWidth: 1.5,
				hidden:true,
				borderColor:'#14540d',
				pointBorderWidth: [1.5],
				pointBorderColor: ['#14540d'],
				pointBackgroundColor: ['#14540d']

			},{
				label: '[S6] Biceps Femoral',		// S6: Isquitobial
				data: 0,
				fill: false,
				borderWidth: 1.5,
				hidden:true,
				borderColor:'#4B0082',
				pointBorderWidth: [1.5],
				pointBorderColor: ['#4B0082'],
				pointBackgroundColor: ['#4B0082']
			}]
		},
		options: Object.assign({}, commonJointsOptions)    
	});
	
	// Vars used for objects agrupation
	var ctx_emg_real_data_objects =  [ctxrhipInstance.data.datasets[1], ctxrhipInstance.data.datasets[2], ctxlhipInstance.data.datasets[1], ctxlhipInstance.data.datasets[2]];
	var ctx_rom_data_objects = [ctxrhipInstance.data.datasets[0],  ctxlhipInstance.data.datasets[0]]

	//var imu1_is_connected = imu2_is_connected = imu3_is_connected = 
	is_swalker_connected = emg_enabled = false;
	
	//** Data incomming from the Webserver (index) **//
	socket.on('monitoring:jointData', (data) => {
		is_swalker_connected = data.swalker_connection_status;
		load = data.load;
		rom_right = data.rom_right;
		rom_left = data.rom_left;
		emg_enabled = data.emg_connection_status;
		emg_data = data.emg;     // json

   
		// Avoid errors in case EMG is not connected
		if ((emg_data.length == 0  || JSON.parse(emg_data).emg == undefined) || (!emg_enabled)) {
			emg = [0,0,0,0,0,0,0,0];
			threshold_errors = [4, 4, 4, 4, 4, 4, 4, 4];    // random code higher than 0
			threshold_values = [0,0,0,0,0,0,0,0];
			binary_activation_values = [0,0,0,0,0,0,0,0];
			max_amplitude_value = [0,0,0,0,0,0,0,0];

		} else {
			if (document.getElementById("enable_emg").value == "connecting"){
				document.getElementById("enable_emg").value = "on";
				document.getElementById("enable_emg").innerHTML = "Desconectar EMG";
				document.getElementById("enable_emg").style.background = "#fd4e4e";
			}

			emg = JSON.parse(emg_data).emg;
			threshold_errors = JSON.parse(emg_data).threshold_errors;
			threshold_values = JSON.parse(emg_data).threshold_values;
			binary_activation_values = JSON.parse(emg_data).binary_activation_values;

			max_amplitude_value = JSON.parse(emg_data).max_emg_values;
		}

		if (therapy_reestart) {
			// Initialize values when therapy reestarts
			therapy_reestart = false;
			emptyJointGraphs();   /////////////////////////////////////////////////////////////////////////////////// incomplete
		}
		
		// Hide/show legend and data.
		if(document.getElementById("connect_swalker").value == "on" && ctxrhipInstance.data.datasets[0].hidden == true){
			showDataset(ctxrhipInstance.data.datasets[0]);
			showDataset(ctxlhipInstance.data.datasets[0]);
		};
		
		
		// Keep the swalker button green and on while swalker is connected.
		if (document.getElementById("connect_swalker").style.background != "#4eb14e" & is_swalker_connected) {
			document.getElementById("connect_swalker").value = "on";
			document.getElementById("connect_swalker").innerHTML = "Desconectar SWalker";
			document.getElementById("connect_swalker").style.background = "#4eb14e";
		}
		
		/*
		// Change IMUs buttons to red if their connection has been closed
		if (document.getElementById("connect_imu1").style.background == "#4eb14e" & !imu1_is_connected) {
			document.getElementById("connect_imu1").value = "on";
			document.getElementById("connect_imu1").innerHTML = "Re-Conectar IMU1";
			document.getElementById("connect_imu1").style.background = "#eb0a0a";
		}
		if (document.getElementById("connect_imu2").style.background == "#4eb14e" & !imu2_is_connected) {
			document.getElementById("connect_imu2").value = "on";
			document.getElementById("connect_imu2").innerHTML = "Re-Conectar IMU2";
			document.getElementById("connect_imu2").style.background = "#eb0a0a";
		}
		if (document.getElementById("connect_imu3").style.background == "#4eb14e" & !imu3_is_connected) {
			document.getElementById("connect_imu3").value = "on";
			document.getElementById("connect_imu3").innerHTML = "Re-Conectar IMU3";
			document.getElementById("connect_imu3").style.background = "#eb0a0a";
		}
		*/
		
		if (therapy_started){
			
			// update data values
			// swalker
			if (is_swalker_connected){
				// show y axis label and ticks
				//commonJointsOptions.scales.yAxes[0].ticks.display = true;
                               // commonJointsOptions.scales.yAxes[0].scaleLabel.display = true;
				// update supported weight
				document.getElementById("supported_weight").innerHTML =  (100*load/patient_weight); 

				// update dataset rom values
				pushDataValue(rom_right, ctxrhipInstance.data.datasets[0], 10, '#FF2626');
				pushDataValue(rom_right, ctxrhipInstance.data.datasets[0], 1.5, '#FF2626');
				pushDataValue(rom_left, ctxlhipInstance.data.datasets[0], 10, '#FF2626');
				pushDataValue(rom_left, ctxlhipInstance.data.datasets[0], 1.5, '#FF2626');
			} 

			//emg
			var upperLeg_binary_activation_values = [binary_activation_values[0], binary_activation_values[1], binary_activation_values[4], binary_activation_values[5]]
			var upperLeg_max_amplitude_values = [max_amplitude_value[0], max_amplitude_value[1], max_amplitude_value[4], max_amplitude_value[5]]
			var upperLeg_threshold_errors = [threshold_errors[0], threshold_errors[1], threshold_errors[4], threshold_errors[5]]
			var upperLeg_y_activation_values = [y_activation_values[0], y_activation_values[1], y_activation_values[4], y_activation_values[5]]
			var upperLeg_emg = [emg[0], emg[1], emg[4], emg[5]]

			if (emg_enabled){
				//ctxlhipInstance.options.scales.yAxes[0].ticks.display = true;
   				//ctxlhipInstance.options.scales.yAxes[0].scaleLabel.display = true;
                                //ctxrhipInstance.options.scales.yAxes[0].ticks.dislpay = true;
				//ctxrhipInstance.options.scales.yAxes[0].scaleLabel.display =  true;

				for (var i = 0; i < ctx_emg_real_data_objects.length ; i++) {
					// define current dataset
					real = ctx_emg_real_data_objects[i];

					// show dataset if it is hidded and the error code is 0
					if (real.hidden == true & (upperLeg_threshold_errors[i] == 0)) {
						showDataset(real);
						
					} else if (upperLeg_threshold_errors[i] == 1) {
						hideDataset(real);
						real.hidden = true;
					}

					// define colors
					currentColorList = define_valueColor(i);
					currentColor, currentWidth = getSampleColorWidth(upperLeg_emg[i], upperLeg_max_amplitude_values[i], currentColorList);
					console.log(currentColor);
					// Check muscle activation. If muscle activated, normalize the value up to the maximum one, then update point color. If not, make it transparent.
					if((upperLeg_binary_activation_values[i] == 1) && (upperLeg_threshold_errors[i] == 0)){
						
						pushDataValue(upperLeg_y_activation_values[i], real, currentWidth, currentColor);
						
					}else{
						pushDataValue(upperLeg_y_activation_values[i], real, 0, "#ff000000");
					}			
				}
			}
			
			if (is_swalker_connected | emg_enabled){
							
					// update labels
					var segundos = Math.trunc(updateCounter_left/20);
					var milisegundos = Math.trunc((updateCounter_left/20 - segundos)*1000)
					var minutos = Math.trunc(segundos/60);
					segundos = segundos - minutos*60; 
					var label = minutos + '-' + segundos + '-' + milisegundos;

					ctxlhipInstance.data.labels.push(label);
					ctxrhipInstance.data.labels.push(label);
						
				// delete first element to keep the graph in movement. PlotSampling data reception: 20Hz --> 2 segundos: 40muestras
				if((updateCounter_right > 60)){
					
					ctxrhipInstance.data.labels.shift();
					ctxlhipInstance.data.labels.shift();
						
					if (is_swalker_connected){
						// y_value
						ctxrhipInstance.data.datasets[0].data.shift();
						ctxlhipInstance.data.datasets[0].data.shift();
						// point width
						ctxrhipInstance.data.datasets[0].pointBorderWidth.shift();
						ctxlhipInstance.data.datasets[0].pointBorderWidth.shift();
						// background color
						ctxrhipInstance.data.datasets[0].pointBackgroundColor.shift();
						ctxlhipInstance.data.datasets[0].pointbackgroundColor.shift();
						// point border color
						ctxrhipInstance.data.datasets[0].pointBorderColor.shift();
						ctxlhipInstance.data.datasets[0].pointBorderColor.shift();
					} 
					
					if(emg_enabled){
						// y_value
						ctxrhipInstance.data.datasets[1].data.shift();
						ctxlhipInstance.data.datasets[1].data.shift();
						ctxrhipInstance.data.datasets[2].data.shift();
						ctxlhipInstance.data.datasets[2].data.shift();
						// Point width
						ctxrhipInstance.data.datasets[1].pointBorderWidth.shift();
						ctxlhipInstance.data.datasets[1].pointBorderWidth.shift();
						ctxrhipInstance.data.datasets[2].pointBorderWidth.shift();
						ctxlhipInstance.data.datasets[2].pointBorderWidth.shift();
						// Background Color
						ctxrhipInstance.data.datasets[1].pointBackgroundColor.shift();
						ctxlhipInstance.data.datasets[1].pointBackgroundColor.shift();
						ctxrhipInstance.data.datasets[2].pointBackgroundColor.shift();
						ctxlhipInstance.data.datasets[2].pointBackgroundColor.shift();
						// Border Color
						ctxrhipInstance.data.datasets[1].pointBorderColor.shift();
						ctxlhipInstance.data.datasets[1].pointBorderColor.shift();
						ctxrhipInstance.data.datasets[2].pointBorderColor.shift();
						ctxlhipInstance.data.datasets[2].pointBorderColor.shift();
					}
					
				} 
			}	
			
		} else {
			ctxlhipInstance.data.labels = ['00:00', '02:00'];
			ctxrhipInstance.data.labels = ['00:00', '02:00'];
		}

		//// update counters and refresh graphs
		///////////////////////////////////////
		updateCounter_right ++;
		updateCounter_left ++;

		ctxrhipInstance.update();
		ctxlhipInstance.update();
	})
	

	socket.on("monitoring:recorded_sessionData", (data) => {
		console.log("recorded!");
		is_data_recorded = true;
	})

	document.getElementById("connect_swalker").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_swalker").value == "off") {
			document.getElementById("connect_swalker").value = "connecting";
			document.getElementById("connect_swalker").style.background = "#808080";
			document.getElementById("connect_swalker").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_swalker');

		// Stop emg_connection
		} else if (document.getElementById("connect_swalker").value == "on") {
			document.getElementById("connect_swalker").value = "off";
			document.getElementById("connect_swalker").innerHTML = "Conectar SWalker";
			document.getElementById("connect_swalker").style.background = "#808080";
			socket.emit('monitoring:disconnect_swalker');
			emptyJointGraphs();

		} else if (document.getElementById("connect_swalker").value == "connecting") {
			document.getElementById("connect_swalker").value = "off";
			document.getElementById("connect_swalker").innerHTML = "Conectar SWalker";
			document.getElementById("connect_swalker").style.background = "#eb0a0a";
			socket.emit('monitoring:disconnect_swalker');
			emptyJointGraphs();
		}
	}	

	document.getElementById("enable_emg").onclick = function() {
		// Start emg connection
		if (document.getElementById("enable_emg").value == "off") {
			document.getElementById("enable_emg").value = "connecting";
			document.getElementById("enable_emg").style.background = "#808080";
			document.getElementById("enable_emg").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_emg');

		// Stop emg_connection
		} else if (document.getElementById("enable_emg").value == "on") {
			
			// end therapy if started
			if (therapy_started){
				document.getElementById("save_data").value = "not_saved";
				document.getElementById("save_data").innerHTML = "Guardar";
				document.getElementById("save_data").style.background = "#fd4e4e";
				document.getElementById("save_data").style.display = 'block';
				document.getElementById("start_stop").value = "start_calibration";
				document.getElementById("start_stop").innerHTML = "NUEVA TERAPIA";
				document.getElementById("start_stop").style.background = "#0968e4";
				document.getElementById("start_stop").style.borderColor = "#0968e4";
				therapy_started = false;
				socket.emit('monitoring:stop'); 
				current_step = 0;
				emptyJointGraphs();
			}
			
			document.getElementById("enable_emg").value = "off";
			document.getElementById("enable_emg").innerHTML = "Conectar EMG";
			document.getElementById("enable_emg").style.background = "#808080";
			socket.emit('monitoring:disconnect_emg');

			for (let i = 0; i < ctx_emg_real_data_objects.length; i++) {
				ds_real = ctx_emg_real_data_objects[i];

				hideDataset(ds_real);
				console.log("hided");
			}

		} else if (document.getElementById("enable_emg").value == "connecting") {
			document.getElementById("enable_emg").value = "off";
			document.getElementById("enable_emg").innerHTML = "Conectar EMG";
			document.getElementById("enable_emg").style.background = "#808080";
			socket.emit('monitoring:disconnect_emg');
		}
	}
	document.getElementById("enable_vr").onclick = function() {
		// Enable VR
		if (document.getElementById("enable_vr").value == "off") {
			document.getElementById("enable_vr").value = "connecting";
			document.getElementById("enable_vr").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_vr');

		// Stop emg_connection
		} else if (document.getElementById("enable_vr").value == "on") {
			document.getElementById("enable_vr").value = "off";
			document.getElementById("enable_vr").innerHTML = "Conectar VR";
			socket.emit('monitoring:disable_vr');

		} else if (document.getElementById("enable_vr").value == "connecting") {
				document.getElementById("enable_vr").value = "off";
				document.getElementById("enable_vr").innerHTML = "Conectar VR";
				document.getElementById("enable_vr").style.background = "#808080";
				socket.emit('monitoring:enable_vr');
		}	
	}
	
	document.getElementById("continue").onclick = function() {
		socket.emit('monitoring:configure_robot');
		var myTimer;
		myTimer = setInterval(myClock, 1000);
		var c = 4;
		function myClock() {
			document.getElementById("start_stop").innerHTML = --c;
				if (c == 0) {
					clearInterval(myTimer);
					document.getElementById("save_data").style.display = 'none';
					document.getElementById("start_stop").value = "start";
					document.getElementById("start_stop").innerHTML = "START";
					document.getElementById("start_stop").style.background = "#09c768";
					document.getElementById("start_stop").style.borderColor = "#09c768";
				}
		}	
	}
	// Start stop interaction
	document.getElementById("start_stop").onclick = function() {
		// Move to the start position and configure the robot with the therapy settings
	//	is_swalker_connected = true
		if (is_swalker_connected || emg_enabled){
			if (document.getElementById("start_stop").value == "start_calibration") {
				if (!is_dataRecorded){
					document.getElementById("start_stop").value = "countdown";
					console.log("start_stop");
					if (is_swalker_connected){
						// show initial position modal (start swalker rom calibrations), then change button content
						$("#modaltherapyadviceinitialposition").modal('show');
					} else {
						// change button content
						var myTimer;
						myTimer = setInterval(myClock, 1000);
						var c = 4;
						function myClock() {
							document.getElementById("start_stop").innerHTML = --c;
								if (c == 0) {
									clearInterval(myTimer);
									document.getElementById("save_data").style.display = 'none';
									document.getElementById("start_stop").value = "start";
									document.getElementById("start_stop").innerHTML = "START";
									document.getElementById("start_stop").style.background = "#09c768";
									document.getElementById("start_stop").style.borderColor = "#09c768";
								}
						}	
					}
				} else {
					$("#modalDataNotSaved").modal('show');

				}
			// Start the therapy
			} else if (document.getElementById("start_stop").value == "start") {
					document.getElementById("start_stop").value = "countdown";
					socket.emit('monitoring:start');
					document.getElementById("save_data").style.display = 'none';
					document.getElementById("start_stop").value = "stop";
					document.getElementById("start_stop").innerHTML = "STOP";
					document.getElementById("start_stop").style.background = "#fd4e4e"; 
					document.getElementById("start_stop").style.borderColor = "#fd4e4e"; 
					therapy_started = true;
					therapy_reestart = true;
					
			}  else if (document.getElementById("start_stop").value == "stop") {
				document.getElementById("save_data").value = "not_saved";
				document.getElementById("save_data").innerHTML = "Guardar";
				document.getElementById("save_data").style.background = "#fd4e4e";
				document.getElementById("save_data").style.display = 'block';
				document.getElementById("start_stop").value = "start_calibration";
				document.getElementById("start_stop").innerHTML = "NUEVA TERAPIA";
				document.getElementById("start_stop").style.background = "#0968e4";
				document.getElementById("start_stop").style.borderColor = "#0968e4";
				therapy_started = false;
				socket.emit('monitoring:stop'); 
				current_step = 0;
				emptyJointGraphs();
			}
		} else {
			console.log("no device connected");
			$("#modaltherapyadvice").modal('show');
		}
	}

	// Start stop interaction
	document.getElementById("save_data").onclick = function() {
		if (document.getElementById("save_data").value == "not_saved") { 
			// Change button style
			document.getElementById("save_data").value = "saved";
			document.getElementById("save_data").innerHTML = "Datos Guardados";
			document.getElementById("save_data").style.background = "#0968e4";
			document.getElementById("save_data").style.display = 'none';
			
			is_dataRecorded = false;
			// Save configurtion 
			socket.emit('addsesiondata')
			socket.emit('monitoring:save_emg')
			// Obtain gait therapy information
			
		}
	};
	
	


	// Advise: changing window and will stop therapy
	document.getElementById("indexHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "index.html";
	};

	document.getElementById("usersHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "users.html";
	};
	document.getElementById("therapySettingsHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "therapy_settings.html";
	};

	document.getElementById("continue-therapy").onclick = function() {
		$("#modal-change-page").modal('hide');
	};
	
	document.getElementById("stop-exit-therapy").onclick = function() {
		// Ensure to end any connection
		
		if(is_swalker_connected){
			socket.emit('monitoring:disconnect_swalker');
			is_swalker_connected = false;
		}
		if(emg_enabled){
			socket.emit('monitoring:disconnect_emg');
			emg_enabled = false;
		}
		// Redirect to the therapy monitoring window
		location.replace(THERAPY_MONITOR_GOTO_LINK)
	};
	document.getElementById('music').addEventListener("click", function() {
		// check if context is in suspended state (autoplay policy)
		if (enable_music) {
			enable_music = false;
		} else {
			enable_music = true;
		}
		console.log(enable_music);
	}, false);

	/*
	document.getElementById("enable_imus").onclick = function() {
		if (document.getElementById("enable_imus").value == "off"){
			imus_enabled = true;
			document.getElementById("enable_imus").value = "on";
			document.getElementById("enable_imus").style.background = "#c4d4e3";
			document.getElementById("enable_imus").style.color = "#000000";
			document.getElementById("enable_imus").innerHTML = "Desconectar IMU(s)";
			document.getElementById("connect_imu1").style.display = "block";
			document.getElementById("connect_imu2").style.display = "block";
			document.getElementById("connect_imu3").style.display = "block";
		} else {
			imus_enabled = false;
			document.getElementById("enable_imus").value = "off";
			document.getElementById("enable_imus").style.background = "#808080";
			document.getElementById("enable_imus").style.color = "#FFFFFF";
			document.getElementById("enable_imus").innerHTML = "Conectar IMU(s)";
			document.getElementById("connect_imu1").innerHTML = "Conectar IMU 1";
			document.getElementById("connect_imu2").innerHTML = "Conectar IMU 2";
			document.getElementById("connect_imu3").innerHTML = "Conectar IMU 3";
			document.getElementById("connect_imu1").style.background = "#808080";
			document.getElementById("connect_imu2").style.background = "#808080";
			document.getElementById("connect_imu3").style.background = "#808080";
			document.getElementById("connect_imu1").style.display = "none";
			document.getElementById("connect_imu2").style.display = "none";
			document.getElementById("connect_imu3").style.display = "none";
			socket.emit('monitoring: disconnect_imus');
		}
	};
	
	
	document.getElementById("connect_imu1").onclick = function() {
		// Start emg connection
		if (document.getElementById("connect_imu1").value == "off") {
			document.getElementById("connect_imu1").value = "connecting";
			document.getElementById("connect_imu1").style.background = "#808080";
			document.getElementById("connect_imu1").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_imu1');

		// Stop emg_connection
		} else if (document.getElementById("connect_imu1").value == "on") {
			document.getElementById("connect_imu1").value = "off";
			document.getElementById("connect_imu1").innerHTML = "Conectar IMU 1";
			document.getElementById("connect_imu1").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu1');

		} else if (document.getElementById("connect_imu1").value == "connecting") {
			document.getElementById("connect_imu1").value = "off";
			document.getElementById("connect_imu1").innerHTML = "Conectar IMU 1";
			document.getElementById("connect_imu1").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu1');
		}
	}	

	document.getElementById("connect_imu2").onclick = function() {
		if (document.getElementById("connect_imu2").value == "off") {
			document.getElementById("connect_imu2").value = "connecting";
			document.getElementById("connect_imu2").style.background = "#808080";
			document.getElementById("connect_imu2").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_imu2');

		} else if (document.getElementById("connect_imu2").value == "on") {
			document.getElementById("connect_imu2").value = "off";
			document.getElementById("connect_imu2").innerHTML = "Conectar IMU 2";
			document.getElementById("connect_imu2").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu2');

		} else if (document.getElementById("connect_imu2").value == "connecting") {
			document.getElementById("connect_imu2").value = "off";
			document.getElementById("connect_imu2").innerHTML = "Conectar IMU 2";
			document.getElementById("connect_imu2").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu2');
		}
	}
	
	document.getElementById("connect_imu3").onclick = function() {
		if (document.getElementById("connect_imu3").value == "off") {
			document.getElementById("connect_imu3").value = "connecting";
			document.getElementById("connect_imu3").style.background = "#808080";
			document.getElementById("connect_imu3").innerHTML = "Conectando...";
			socket.emit('monitoring:connect_imu3');

		} else if (document.getElementById("connect_imu3").value == "on") {
			document.getElementById("connect_imu3").value = "off";
			document.getElementById("connect_imu3").innerHTML = "Conectar IMU 3";
			document.getElementById("connect_imu3").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu3');

		} else if (document.getElementById("connect_imu3").value == "connecting") {
			document.getElementById("connect_imu3").value = "off";
			document.getElementById("connect_imu3").innerHTML = "Conectar IMU 3";
			document.getElementById("connect_imu3").style.background = "#808080";
			socket.emit('monitoring:disconnect_imu3');
		}
	}	
	*/
	
	// Move the platform functions
	const $arrow_right = document.querySelector('.arrow_right');
	const $arrow_left = document.querySelector('.arrow_left');
	const $arrow_fordward = document.querySelector('.arrow_fordward');
	const $arrow_backwards = document.querySelector('.arrow_backwards');
	const $stop = document.querySelector('.circle');

	$stop.onclick = () => {

	  document.getElementById("direction_html").innerHTML = "Stop";
	  //document.getElementById("direction_html").innerHTML = "Right...";
	  direction_char = "s";
	  sendTraction(socket, direction_char);

	  document.querySelector('.circle').style.background = '#00008b';
	  document.querySelector('.arrow_right').style.background = "background: #0968e4";
	  document.querySelector('.arrow_left').style.background = "background: #0968e4";
	  document.querySelector('.arrow_fordward').style.background = "background: #0968e4";
	  document.querySelector('.arrow_backwards').style.background = "background: #0968e4";
	}

	// Animate and get the selected direction of motion
	$arrow_right.onclick = () => {

	  document.getElementById("direction_html").innerHTML = "Girando a la derecha...";

	  //document.getElementById("direction_html").innerHTML = "Right...";
	  direction_char = "r";
	  sendTraction(socket, direction_char);

	  document.querySelector('.circle').style.background = '#0968e4';
	  document.querySelector('.arrow_right').style.background = "#00008b";
	  document.querySelector('.arrow_left').style.background = "#0968e4";
	  document.querySelector('.arrow_fordward').style.background = "#0968e4";
	  document.querySelector('.arrow_backwards').style.background = "#0968e4";

	  $arrow_right.animate([
	    {left: '0'},
	    {left: '10px'},
	    {left: '0'}
	  ],{
	    duration: 700,
	    iterations: 1
	  });
	}


	$arrow_left.onclick = () => {

	  document.getElementById("direction_html").innerHTML = "Girando a la izquierda...";

	  direction_char = "l";
	  sendTraction(socket, direction_char);

	  document.querySelector('.circle').style.background = '#0968e4';
	  document.querySelector('.arrow_right').style.background = "#0968e4";
	  document.querySelector('.arrow_left').style.background = "#00008b";
	  document.querySelector('.arrow_fordward').style.background = "#0968e4";
	  document.querySelector('.arrow_backwards').style.background = "#0968e4";

	  $arrow_left.animate([
	    {left: '0'},
	    {left: '10px'},
	    {left: '0'}
	  ],{
	    duration: 700,
	    iterations: 1
	  });
	}
	 
	$arrow_fordward.onclick = () => {
	  document.getElementById("direction_html").innerHTML = "Avanzando...";
	  direction_char= "f";
	 sendTraction(socket, direction_char);

	  document.querySelector('.circle').style.background = '#0968e4';
	  document.querySelector('.arrow_right').style.background = "#0968e4";
	  document.querySelector('.arrow_left').style.background = "#0968e4";
	  document.querySelector('.arrow_fordward').style.background = "#00008b";
	  document.querySelector('.arrow_backwards').style.background = "#0968e4";

	  $arrow_fordward.animate([
	    {left: '0'},
	    {left: '10px'},
	    {left: '0'}
	  ],{
	    duration: 700,
	    iterations: 1
	  });
	}

	$arrow_backwards.onclick = () => {

	  document.getElementById("direction_html").innerHTML = "Retrocediendo...";
	  direction_char = "b";
	  sendTraction(socket, direction_char);

	  document.querySelector('.circle').style.background = '#0968e4';
	  document.querySelector('.arrow_right').style.background = "#0968e4";
	  document.querySelector('.arrow_left').style.background = "#0968e4";
	  document.querySelector('.arrow_fordward').style.background = "#0968e4";
	  document.querySelector('.arrow_backwards').style.background = "#00008b";

	  $arrow_backwards.animate([
	    {left: '0'},
	    {left: '10px'},
	    {left: '0'}
	  ],{
	    duration: 700,
	    iterations: 1
	  });
	}	

	// Empty joint graphs
	function emptyJointGraphs() {
		//update counters
		//updateCount = 0;
		updateCounter_left = 0;
		updateCounter_right = 0;

		//reset hip rom labels and datasets
		ctxrhipInstance.data.labels = [];
		ctxrhipInstance.data.datasets[0].data = [];	
		ctxrhipInstance.data.datasets[1].data = [];	
		ctxrhipInstance.data.datasets[2].data = [];	
		ctxlhipInstance.data.labels = [];
		ctxlhipInstance.data.datasets[0].data = [];
		ctxlhipInstance.data.datasets[1].data = [];
		ctxlhipInstance.data.datasets[2].data = [];
		
	}
};





// Show modal if click on change page
function preventChange() {
	$("#modal-change-page").modal('show');
 };


 // Stop therapy in case of window reunload
window.onbeforeunload = function() {
	socket.emit("monitoring:stop");
}

// Show therapy settings in table
socket.emit('monitoring:ask_therapy_settings');
socket.on('monitoring:show_therapy_settings', (data) => {
	console.log(data)


	// Display in HTML the therapy configuration
	document.getElementById("patient").innerHTML =  data.patient_name;
	document.getElementById("age").innerHTML =  data.patient_age;
	document.getElementById("gait_velocity").innerHTML = data.gait_velocity;
	document.getElementById("Weight").innerHTML =  data.patient_weight; 
	document.getElementById("LegLength").innerHTML =  data.leg_length;
});

socket.on('monitoring:connection_status', (data) => {
	let device= data.device;
	let status= data.status;
	console.log(data);
	if(device == 'swalker'){
		if (status==0){
			console.log("is con")
			//change button color and text;
			document.getElementById("connect_swalker").value = "on";
			document.getElementById("connect_swalker").innerHTML = "Desconectar SWalker";
			document.getElementById("connect_swalker").style.background = "#4eb14e";
			is_swalker_connected = true
		} else {
			console.log("error connection");
			//change button color and text;
			document.getElementById("connect_swalker").value = "off";
			document.getElementById("connect_swalker").innerHTML = "Re-Conectar SWALKER";
			document.getElementById("connect_swalker").style.background = "#eb0a0a";
			is_swalker_connected = false;
		}

	} else if ( device == 'emg'){
		if(status == 0){
			console.log("is con")
			//change button color and text;
			document.getElementById("enable_emg").value = "on";
			document.getElementById("enable_emg").innerHTML = "Desconectar EMG";
			document.getElementById("enable_emg").style.background = "#4eb14e";
			emg_enabled = true
		} else if(status == 3 || status == 2 || status == 4){
			console.log("error connection")
			//change button color and text;
			document.getElementById("enable_emg").value = "off";
			document.getElementById("enable_emg").innerHTML = "Re-Conectar EMG ";
			document.getElementById("enable_emg").style.background = "#eb0a0a";
			emg_enabled = false
		} else if(status == 1){
			console.log("emg disconnected")
			//change button color and text;
			document.getElementById("enable_emg").value = "off";
			document.getElementById("enable_emg").innerHTML = "Conectar EMG";
			document.getElementById("enable_emg").style.background = "#808080";
			emg_enabled = false
		}

	} else if ( device == 'vr'){
		if (status == 0){
			console.log("is con")
			//change button color and text;
			document.getElementById("enable_vr").value = "on";
			document.getElementById("enable_vr").innerHTML = "VR Conectado";
			document.getElementById("enable_vr").style.background = "#4eb14e";
		} else if (status == 1 || status == 2){
			console.log("error connection")
			//change button color and text;
			document.getElementById("enable_vr").value = "off";
			document.getElementById("enable_vr").innerHTML = "Re-Conectar VR";
			document.getElementById("enable_vr").style.background = "#eb0a0a";
		}
	}
});

// Send wheels velocity to the server
function sendTraction(socket, direction){   
    // Send data to server
    socket.emit('traction:message', {
        direction_char: direction
    })
}

function pushDataValue(value, dataset, border_size, currentColor){
	dataset.data.push(value);
	dataset.pointBorderWidth.push(border_size);
	dataset.pointBackgroundColor.push(currentColor);
	dataset.pointBorderColor.push(currentColor);
};

function hideDataset(dataset){
	dataset.hidden = true;
}

function showDataset(dataset){
	dataset.hidden = false;
}

function define_valueColor(i){
	// check i parity in order to select the correct dataset. 
	if( i%2 == 0){
		// Line colors for each activation level
		currentColor1 = '#93bf85';
		currentColor2 = '#6eaa5e';
		currentColor3 = '#469536';
		currentColor4 = '#0f6a08';
		currentColor5 = '#14540d';

	}else{
		// Line colors for each activation level
		currentColor1 = '#DDA0DD';
		currentColor2 = '#DA70D6';
		currentColor3 =  '#BA55D3';
		currentColor4 = '#9400D3';
		currentColor5 = '#4B0082';	
	}

	currentColorList = [currentColor1, currentColor2, currentColor3, currentColor4, currentColor5]
	console.log(currentColorList);
	return currentColorList

}

function getSampleColorWidth(current_emg_value, max_value, currentColorList){
	normalized_value = current_emg_value/max_value;
	// Activated: Green / purple scales.
	if (normalized_value < 0.2) {
		currentColor = currentColorList[0];
		currentWidth = 3.5;

	} else if (0.2< normalized_value < 0.4) {
		currentColor = currentColorList[1];
		currentWidth = 5.5;

	} else if (0.4 < normalized_value < 0.6) {
		currentColor = currentColorList[2];
		currentWidth = 7.5;

	} else if (0.6 < normalized_value < 0.8) {
		currentColor = currentColorList[3];
		currentWidth = 9.5;

	} else if (normalized_value > 0.8) {
		currentColor = currentColorList[4];
		currentWidth = 11;
	}
	console.log(currentColor, currentWidth);
	return currentColor, currentWidth;
}


function absolute_min_value(previous_rom, current_rom, found, nsteps){
	if(current_rom < 0){
		if (!found){
			if (Math.abs(parseFloat(current_rom)) < Math.abs(parseFloat(previous_rom))){
				found = true;
				nsteps += 1;
				previous_rom = 1;
				console.log(" encontrado!");
				console.log(current_rom)

			} else {
				found = false;
				previous_rom = parseInt(current_rom);
			}
		} 
	} else {
		found = false
	}

	return [previous_rom, found, nsteps]
};

