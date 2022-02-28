

const dgram = require('dgram');
const path = require('path'); // Modulo de nodejs para trabajar con rutas
const express = require('express'); // Configurar express
const fs = require('fs'); //  File System module
const {spawn} = require ('child_process');
const {exec} = require ('child_process');
const net = require('net');
const http = require('http');
const SerialPort = require('serialport');
const udp = require('dgram');

const BluetoothClassicSerialportClient = require('bluetooth-classic-serialport-client');
//const (createBluetooth) = require('node-ble');

var mode_sw = false;
var mode_games = false;

const serial_swalker = new BluetoothClassicSerialportClient();
const serial_imu1 = new BluetoothClassicSerialportClient();
//const serial_imu2 = new BluetoothClassicSerialportClient();
//const serial_imu3 = new BluetoothClassicSerialportClient();

// Relative configuration file path:
var therapyConfigPath = path.join(__dirname, 'config','therapySettings.json');

// Execute python program to control the rehaStym when server starts
const python = spawn('python', ['rehaStym_configuration.py']);

const PLOTSAMPLINGTIME = 10
0; //ms
const GAMESSAMPLINGTIME = 50;

const swBluetoothName = 'RNBT-4CEE';
var is_swalker_connected = false;
var speed_char = 's';
var direction_char = 's';
var global_patiente_weight;
var patient_leg_length = 0;
var counter = 0;

var test_rom_right_vector = [36.5585, 36.5259, 36.4962, 36.4689, 36.4408, 36.3909, 36.335, 36.271, 36.1943, 36.0842, 35.9539, 35.8015, 35.6229, 35.3996, 35.1472, 34.8671, 34.5588, 34.2085, 33.8337, 33.4375, 33.021, 32.5716, 32.1055, 31.6253, 31.1309, 30.6092, 30.0759, 29.5333, 28.982, 28.4101, 27.8326, 27.2519, 26.6686, 26.0712, 25.4745, 24.881, 24.2907, 23.6928, 23.0991, 22.5103, 21.9251, 21.3314, 20.7416, 20.1566, 19.576, 18.9904, 18.4092, 17.8328, 17.26, 16.6806, 16.1042, 15.5317, 14.9625, 14.3888, 13.8194, 13.2551, 12.6957, 12.1344, 11.5788, 11.0296, 10.4863, 9.943, 9.4059, 8.8751, 8.35, 7.8256, 7.307, 6.7943, 6.2873, 5.782, 5.2825, 4.789, 4.3013, 3.8162, 3.3365, 2.8623, 2.3931, 1.9264, 1.4649, 1.0089, 0.55876, 0.11339, -0.32492, -0.75545, -1.1777, -1.592, -1.9966, -2.3906, -2.7733, -3.1449, -3.503, -3.8462, -4.1732, -4.483, -4.7732, -5.0422, -5.2883, -5.5107, -5.7056, -5.8703, -6.0025, -6.1013, -6.1635, -6.1873, -6.1715, -6.117, -6.0199, -5.8784, -5.691, -5.4588, -5.1776, -4.8459, -4.4624, -4.0296, -3.5434, -3.0028, -2.408, -1.7637, -1.0667, -0.31824, 0.47919, 1.3179, 2.1989, 3.1186, 4.0724, 5.0499, 6.0517, 7.0737, 8.1109, 9.1527, 10.2008, 11.2518, 12.3017, 13.3403, 14.3718, 15.3946, 16.4062, 17.397, 18.3728, 19.3328, 20.2749, 21.189, 22.0824, 22.9548, 23.805, 24.6222, 25.4163, 26.1884, 26.9377, 27.6538, 28.3466, 29.0165, 29.6621, 30.2707, 30.8549, 31.416, 31.9538, 32.4557, 32.9354, 33.3942, 33.8315, 34.2332, 34.613, 34.9714, 35.3072, 35.6047, 35.8803, 36.136, 36.3716, 36.5725, 36.7541, 36.9172, 37.0604, 37.1663, 37.2525, 37.3207, 37.3704, 37.3856, 37.3845, 37.3695, 37.3407, 37.2817, 37.2124, 37.1364, 37.0547, 36.9514, 36.8478, 36.7477, 36.6527, 36.5465, 36.4502, 36.367, 36.2969, 36.2222, 36.1618, 36.1168, 36.085, 36.046, 36.0174, 35.9986, 35.9863];
var test_rom_left_vector = [36.5585, 36.5259, 36.4962, 36.4689, 36.4408, 36.3909, 36.335, 36.271, 36.1943, 36.0842, 35.9539, 35.8015, 35.6229, 35.3996, 35.1472, 34.8671, 34.5588, 34.2085, 33.8337, 33.4375, 33.021, 32.5716, 32.1055, 31.6253, 31.1309, 30.6092, 30.0759, 29.5333, 28.982, 28.4101, 27.8326, 27.2519, 26.6686, 26.0712, 25.4745, 24.881, 24.2907, 23.6928, 23.0991, 22.5103, 21.9251, 21.3314, 20.7416, 20.1566, 19.576, 18.9904, 18.4092, 17.8328, 17.26, 16.6806, 16.1042, 15.5317, 14.9625, 14.3888, 13.8194, 13.2551, 12.6957, 12.1344, 11.5788, 11.0296, 10.4863, 9.943, 9.4059, 8.8751, 8.35, 7.8256, 7.307, 6.7943, 6.2873, 5.782, 5.2825, 4.789, 4.3013, 3.8162, 3.3365, 2.8623, 2.3931, 1.9264, 1.4649, 1.0089, 0.55876, 0.11339, -0.32492, -0.75545, -1.1777, -1.592, -1.9966, -2.3906, -2.7733, -3.1449, -3.503, -3.8462, -4.1732, -4.483, -4.7732, -5.0422, -5.2883, -5.5107, -5.7056, -5.8703, -6.0025, -6.1013, -6.1635, -6.1873, -6.1715, -6.117, -6.0199, -5.8784, -5.691, -5.4588, -5.1776, -4.8459, -4.4624, -4.0296, -3.5434, -3.0028, -2.408, -1.7637, -1.0667, -0.31824, 0.47919, 1.3179, 2.1989, 3.1186, 4.0724, 5.0499, 6.0517, 7.0737, 8.1109, 9.1527, 10.2008, 11.2518, 12.3017, 13.3403, 14.3718, 15.3946, 16.4062, 17.397, 18.3728, 19.3328, 20.2749, 21.189, 22.0824, 22.9548, 23.805, 24.6222, 25.4163, 26.1884, 26.9377, 27.6538, 28.3466, 29.0165, 29.6621, 30.2707, 30.8549, 31.416, 31.9538, 32.4557, 32.9354, 33.3942, 33.8315, 34.2332, 34.613, 34.9714, 35.3072, 35.6047, 35.8803, 36.136, 36.3716, 36.5725, 36.7541, 36.9172, 37.0604, 37.1663, 37.2525, 37.3207, 37.3704, 37.3856, 37.3845, 37.3695, 37.3407, 37.2817, 37.2124, 37.1364, 37.0547, 36.9514, 36.8478, 36.7477, 36.6527, 36.5465, 36.4502, 36.367, 36.2969, 36.2222, 36.1618, 36.1168, 36.085, 36.046, 36.0174, 35.9986, 35.9863];


//////////////////////////////
////////** SWalker**//////////
//////////////////////////////

////// ACCelerometer data dELSYS ////
const client_delsys_acc = new net.Socket();
const delsys_acc_port = 50042;
/////////////////////
//** EMG Conection **//
/////////////////////
// The webserver is connected to a EMG Delsys device that streams
// the emg data from the 8 sensors.

const client_delsys_start = new net.Socket();
const client_delsys_data = new net.Socket();
const DELSYS_PC_IP = '192.168.43.10';
const DELSYS_START_PORT = 30000;
const DELSYS_DATA_PORT = 30002;
var is_delsys_connected = false;
var emg_msg = "";    // var sent to therapy_monitoring.js
var emg_binary_activation_vector = [];
var emg_activity_vector = [];

var tibiaR_accX_vector = [];
var tibiaR_accY_vector = [];
var tibiaR_accZ_vector = [];
var tibiaL_accX_vector = [];
var tibiaL_accY_vector = [];
var tibiaL_accZ_vector = [];
var tibiaR_accX = 0;
var tibiaR_accY = 0;
var tibiaR_accZ = 0;
var tibiaL_accX = 0;
var tibiaL_accY = 0;
var tibiaL_accZ = 0;




client_delsys_data.on('data', function(data) {
    var datos = data.toString();
    var msg_data = false;
    var received_data = "";
    
    for (let index = 0; index < datos.length; index++) {
        if (datos.charAt(index) == '{' || msg_data) {
            // Head of the message
            msg_data = true;
            received_data = received_data + datos.charAt(index);
            if (datos.charAt(index) == '}') {
                // End of the message
                msg_data = false;
                emg_msg = received_data;
                //console.log(JSON.parse(emg_msg).emg)
                received_data = "";
                //found = true;
                
                if (record_therapy){
					
					// if swalker is not connected -> store data
					time_stamp_vector.push(Date.now());
					emg_activity_vector.push(JSON.parse(emg_msg).emg);
					emg_binary_activation_vector.push(JSON.parse(emg_msg).binary_activation_values);
				
					// acc
					tibiaR_accX_vector.push(tibiaR_accX)
					tibiaR_accY_vector.push(tibiaR_accY)
					tibiaR_accZ_vector.push(tibiaR_accZ)
					tibiaL_accX_vector.push(tibiaL_accX)
					tibiaL_accY_vector.push(tibiaL_accY)
					tibiaL_accZ_vector.push(tibiaL_accZ)
					
					if(is_swalker_connected){
						// swalker data
						rom_left_vector.push(parseFloat(rom_left-rom_left_calibration));
						rom_right_vector.push(parseFloat(rom_right-rom_right_calibration));
						load_vector.push((parseFloat(load)/global_patiente_weight)*100);
						direction_vector.push(direction_char);
					}
                }
            }
        }
    }
});

var index_channel = 1;
/*client_delsys_acc.on('data', function(msg) {
    var len = Buffer.byteLength(msg)
	
    index_channel = decodeFloat(msg, index_channel);
    
    
});*/

/////////////////////////////////
//** Webserver configuration **//
/////////////////////////////////
//
// Express initialization SWalker
const app = express();
app.set('port', process.env.PORT || 3000)
// Send static files
app.use(express.static(path.join(__dirname, 'public')));
// Configure PORT of the web
const server = app.listen(app.get('port'), () => {
    console.log('Server', app.get('port'));
})

/////////////////////////////////
//** Socket io configuration **//
/////////////////////////////////
// Socket io is the javascript library used for the
// realtime, bi-directional communication between web
// clients and servers.
//
// Give the server to socketio
const SocketIO = require('socket.io');
const io = SocketIO(server);


const WebSocket = require('ws');
//const io_games = SocketIO(server_games);
const io_games = new WebSocket.Server({port:3001}, () =>{
	console.log("server 3001");
});


////////////////////////////////
//** Database configuration **//
////////////////////////////////
//
var mysql = require('mysql');

////////////////////////////////////
//** Export .xlsx configuration **//
////////////////////////////////////
//
const ExcelJS = require('exceljs');
const { parse } = require('path');
// Identificators database files 
var data_session_id;


//////////////////////////////
//***** SW part Data Reception *****//
//////////////////////////////
//

// vars of recorded therapy data
var record_therapy = false;
var time_stamp_vector = [];
var therapy_speed = 's';
// vars used to imus storage
var is_first_datais_first_data = [true, true, true, true];   //sw, imu1, imu2, imu3
var is_imu1_connected = false;

// vars used for the imus data reception
var ascii_msg_imu1;
var imu1_yaw; 
var imu1_pitch;
var imu1_roll;
var ascii_msg_imu2;
var imu2_yaw; 
var imu2_pitch;
var imu2_roll;
var ascii_msg_imu3;
var imu3_yaw; 
var imu3_pitch;
var imu3_roll;
// vars used for swalker data storage
var rom_left_vector = rom_right_vector = load_vector = direction_vector = [];
// vars used for the swalker data reception
var rom_left; 
var rom_right; 
var load;
var ascii_msg;
// vars used for SWII calibration
var rom_left_calibration = rom_right_calibration = 0;
// session vars
var load_session_rom_right = load_session_rom_left = load_session_weight_gauge =[];
var load_session_rom_right_objects = load_session_rom_left_objects = load_session_weight_gauge_objects = [];

// VR vars
var sockets = Object.create(null);
var udpServer_VR = net.createServer();
udpServer_VR.listen(41235);
var is_client_connected = false;
var vr_ready = false; 

udpServer_VR.on('connection', function(socket){
	socket.nickname = "conVR";
	var clientname = socket.nickname;
	sockets[clientname] = socket;

	console.log('a new connection on 41234 (VR)');
	is_client_connected = true;
	socket.on('data',function(data){
		console.log(data.toString());
		if (data.toString() == "#ready"){
			setInterval(function () {
				if (is_swalker_connected){ 
					var m = rom_right_vector[i].toString() + "|" + rom_left_vector[i].toString() + "|";
					socket.write(m);
				}
			}, PLOTSAMPLINGTIME);
	   }
	});
});

var lasthex_sw = "";
// SWalker data reception (bt)
serial_swalker.on('data', function(data){ 
	var items = 3;
    ascii_msg, is_first_data[0] = hex2a_general(data, items, lasthex_sw, is_first_data[0])
    lasthex_sw = ascii_msg[2];
    if (ascii_msg[0] == 0){
    	let data_vector = ascii_msg[1].split('=')[1].split(',');
    	if (data_vector.length == 3){
            // Data storage
            rom_left = parseFloat(data_vector[2]);
            rom_right = parseFloat(data_vector[1]);
            load = parseFloat(data_vector[0]);
            
            if (record_therapy){
				
				if(! is_delsys_connected){
					// swalker data
					rom_left_vector.push(parseFloat(rom_left-rom_left_calibration));
					rom_right_vector.push(parseFloat(rom_right-rom_right_calibration));
					load_vector.push((parseFloat(load)/global_patiente_weight)*100);
					time_stamp_vector.push(Date.now());
					direction_vector.push(direction_char);
                
				}
            }

            if(vr_ready){
                console.log(data);
                sockets["conVR"].write(data, function(){
					console.log("e")
				});
				
				
            }
		} 
    }
}); 

var lasthex_imu1 = "";
var dcm_msgData = "";
var dcm_mode = false;
// IMU1 data reception (bt)
serial_imu1.on('data', function(data){ 
	
	// Check imu mode (DCM or ANGLES)
	if (data.toString().includes("#")){
		let key = data.toString().split('#')[1].substr(0,3)
		if (key == 'DCM'){
			dcm_mode = true;
		} else if (key == 'YPR'){
			dcm_mode = false;
		}  
	}
	
	// GAMES interface mode
	if (mode_games){
		
		// In Games mode the DCM matrix is needed. 
		if (!dcm_mode){
			
			// To change the imu streaming mode to DCM, the command "#om" must be sent
			var buf = Buffer.from('#om', 'utf8');
			serial_imu1.write(buf)
			.then(() => console.log('Command "#om" successfully written'))
			.catch((err) => console.log('Error en envío del cmando #om a imu', err))
			
			dcm_mode = true;
		
		// The imu streamming mode is already in DCM
		} else{
			
			// get the entire message from the received data ('#DCM= arg1, arg2...., arg10')
			 ascii_msg_imu1 = hex2a_general(data, 10, lasthex_imu1, is_first_data[1]);
			 lasthex_imu1 = ascii_msg_imu1[2];
			 is_first_data[1] = ascii_msg_imu1[3];
			 
			 // ascii_msg_imu1[0] returns 0 if the data message is complete, and 1 if it is not.
			 if (ascii_msg_imu1[0] == 0){	
				let data_vector = ascii_msg_imu1[1].split('=')[1].split(',');
				let data_key = ascii_msg_imu1[1].split('=')[0]
				
				// store the data message into "dcm_msgData" variable, which will be sent to the client socket games.
				dcm_msgData = ascii_msg_imu1[1];	
			}
		}	
    } 
    
    /*
	// SWalker interface mode	
    if (mode_sw) {
		
		// In SWALKER mode the angles Yaw Pitch Roll are needed (imu mode #YPR)
		if(!dcm_mode){
			
			// get the entire data message
			let items = 9;
			ascii_msg_imu1 = hex2a_general(data, items, lasthex_imu1, is_first_data[1]);
			lasthex_imu1 = ascii_msg_imu1[2];
			is_first_data[1] = ascii_msg_imu1[3];
			
			// if the message data is correct, then split it up and store angles data.
			if (ascii_msg_imu1[0] == 0){	
				
				let data_vector = ascii_msg_imu1[1].split('=')[1].split(',');
				let data_key = ascii_msg_imu1[1].split('=')[0]
				
				// Data storage
				imu1_yaw = parseFloat(data_vector[0]);
				imu1_pitch = parseFloat(data_vector[1]);
				imu1_roll = parseFloat(data_vector[2]);
				
				if(record_therapy){
					if(!is_swalker_connected & !is_delsys_connected){
						time_stamp_vector.push(Date.now());
						imu1_yaw_vector.push(parseFloat(imu1_yaw));
						imu1_pitch_vector.push(parseFloat(imu1_pitch));
						imu1_roll_vector.push(parseFloat(imu1_roll));
								
						if(is_imu2_connected){
							imu2_pitch_vector.push(parseFloat(imu2_pitch));
							imu2_roll_vector.push(parseFloat(imu2_roll));
							imu2_yaw_vector.push(parseFloat(imu2_yaw));
						}
							
						if(is_imu3_connected){
							imu3_pitch_vector.push(parseFloat(imu3_pitch));
							imu3_roll_vector.push(parseFloat(imu3_roll));
							imu3_yaw_vector.push(parseFloat(imu3_yaw));
						}
					}
				}
			}
		
		// The imu is streaming into #DCM mode
		} else {
			// To change the imu streaming mode to YPR, the command "#ot" must be sent
			var buf = Buffer.from('#ot', 'utf8');
			serial_imu1.write(buf)
			.then(() => console.log('Command "#ot" successfully written'))
			.catch((err) => console.log('Error en envío del cmando #om a imu', err))
			
			dcm_mode = false;
		}  
	}
	*/
}); 

serial_imu1.on('closed', function(){
	console.log("connection closed");
	
	sockets['websocket'].emit('games:connection_status',{
		 device: "imu1",
		 status:3
	}) 
	
	sockets['websocket'].emit('monitoring:connection_status',{
		 device: "imu1",
		 status:3
	})  
	disconnect_bt_device(sockets['websocket'], serial_imu1, is_imu1_connected, "imu1")

})

/*
var data_imu2;
var lasthex_imu2 = "";
serial_imu2.on('data', function(data){ 
	
	// Check imu mode (DCM or ANGLES)
	if (data.toString().includes("#")){
		let key = data.toString().split('#')[1].substr(0,3)
		if (key == 'DCM'){
			dcm_mode = true;
		} else if (key == 'YPR'){
			dcm_mode = false;
		}  
	}
	
	// SWalker interface mode	
    if (mode_sw) {
		
		// In SWALKER mode the angles Yaw Pitch Roll are needed (imu mode #YPR)
		if(!dcm_mode){
			
			// get the entire data message
			let items = 9; 
			ascii_msg_imu2 = hex2a_general(data, items, lasthex_imu2, is_first_data[2])
			lasthex_imu2 = ascii_msg_imu2[2];
			is_first_data[2] = ascii_msg_imu2[3];
			
			// if the message data is correct, then split it up and store angles data.
			if (ascii_msg_imu2[0] == 0){	
				
				let data_vector = ascii_msg_imu2[1].split('=')[1].split(',');
				let data_key = ascii_msg_imu2[1].split('=')[0]
				
				// Data storage
				imu2_yaw = parseFloat(data_vector[0]);
				imu2_pitch = parseFloat(data_vector[1]);
				imu2_roll = parseFloat(data_vector[2]);
			   
				if(record_therapy){
					if((!is_swalker_connected & !is_delsys_connected )& !is_imu1_connected){
						time_stamp_vector.push(Date.now());
						imu2_yaw_vector.push(parseFloat(imu2_yaw));
						imu2_pitch_vector.push(parseFloat(imu2_pitch));
						imu2_roll_vector.push(parseFloat(imu2_roll));
						
						if(is_imu3_connected){
							imu3_pitch_vector.push(parseFloat(imu3_pitch));
							imu3_roll_vector.push(parseFloat(imu3_roll));
							imu3_yaw_vector.push(parseFloat(imu3_yaw));
						}
							
					}
					
				}
			}
		
		// The imu is streaming into #DCM mode
		} else {
			
			// To change the imu streaming mode to YPR, the command "#ot" must be sent
			var buf = Buffer.from('#ot', 'utf8');
			serial_imu1.write(buf)
			.then(() => console.log('Command "#ot" successfully written'))
			.catch((err) => console.log('Error en envío del cmando #om a imu', err))
			
			dcm_mode = false;
		}  
	}
}); 
serial_imu2.on('closed', function(){
	
	console.log("connection with imu2 closed");
	
	sockets['websocket'].emit('monitoring:connection_status',{
		 device: "imu2",
		 status:3
	})  //disconnected 
	
	disconnect_bt_device(sockets['websocket'], serial_imu2, is_imu2_connected, "imu2")
})


var data_imu3;
var lasthex_imu3 = "";
serial_imu3.on('data', function(data){ 
	
	// Check imu mode (DCM or ANGLES)
	if (data.toString().includes("#")){
		let key = data.toString().split('#')[1].substr(0,3)
		if (key == 'DCM'){
			dcm_mode = true;
		} else if (key == 'YPR'){
			dcm_mode = false;
		}  
	}
	
	// SWalker interface mode	
    if (mode_sw) {
		
		// In SWALKER mode the angles Yaw Pitch Roll are needed (imu mode #YPR)
		if(!dcm_mode){
			
			// get the entire data message
			let items = 9;
			ascii_msg_imu3 = hex2a_general(data, items, lasthex_imu3, is_first_data[3])
			lasthex_imu3 = ascii_msg_imu3[2];
			is_first_data[3] = ascii_msg_imu3[3];
			
			// if the message data is correct, then split it up and store angles data.
			if (ascii_msg_imu3[0] == 0){	
				
				let data_vector = ascii_msg_imu3[1].split('=')[1].split(',');
				
				 // Data storage
				imu3_yaw = parseFloat(data_vector[0]);
				imu3_pitch = parseFloat(data_vector[1]);
				imu3_roll = parseFloat(data_vector[2]);
			   
				if(record_therapy){
					if((!is_swalker_connected & !is_delsys_connected )& (!is_imu1_connected & !is_imu2_connected)){
						time_stamp_vector.push(Date.now());
						imu3_yaw_vector.push(parseFloat(imu3_yaw));
						imu3_pitch_vector.push(parseFloat(imu3_pitch));
						imu3_roll_vector.push(parseFloat(imu3_roll));
							
					}
					
				}
			}
		
		// The imu is streaming into #DCM mode
		} else {
			
			// To change the imu streaming mode to YPR, the command "#ot" must be sent
			var buf = Buffer.from('#ot', 'utf8');
			serial_imu1.write(buf)
			.then(() => console.log('Command "#ot" successfully written'))
			.catch((err) => console.log('Error en envío del cmando #om a imu', err))
			
			dcm_mode = false;
		}  
	}
	
}); 
serial_imu3.on('closed', function(){
	console.log("connection with imu3 closed");
	
	sockets['websocket'].emit('monitoring:connection_status',{
		 device: "imu3",
		 status:3
	})  //disconnected 
	
	disconnect_bt_device(sockets['websocket'], serial_imu3, is_imu3_connected, "imu3")
		
})
*/

///////////////////////////////////////
//*** Server-Client communication ***//
///////////////////////////////////////
//
//Connect with DataBase CPW_DB
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "swdb",
    multipleStatements: true
});

var con_games = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "weriumGames",
    multipleStatements: true
});

// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);
    sockets['websocket'] = socket;
    
    // send imu_connection_status to games_index webpage
    if (mode_games){
		socket.emit('games:connection_status',{
		 device: "imu1",
		 status:3
		}) 
		
	} 
    
    var datitos=[];

    // ***** SW DATABASE INTERACTIONS
    socket.on('refreshlist',function() {
        console.log("Connected!");
        console.log("Connected Sessions!");
        var sql = "SELECT * FROM tabla_sesion JOIN tabla_pacientes ON tabla_sesion.idPaciente = tabla_pacientes.idtabla_pacientes JOIN tabla_terapeutas ON tabla_sesion.idTerapeuta = tabla_terapeutas.idtabla_terapeutas";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
            socket.emit('datostabla', sessions_data);   //session_data---- datos de las sesiones (configuraciones)
        });
        console.log("Connected Patient!");
        var sql = "SELECT * FROM tabla_pacientes";
        con.query(sql, function (err, patients_list) {
            if (err) throw err;
            socket.emit('patientdata', patients_list);  //patients_list ----- lista de pacientes(id-nombre-apellido)
        });
        console.log("Connected Therapist!");
        var sql = "SELECT * FROM tabla_terapeutas";
        con.query(sql, function (err, therapist_list) {
            if (err) throw err;
            socket.emit('therapistdata', therapist_list);     //therapist_list ---- Lista de Terapeutas, id-nombre-apellido-centro
        });
        var sql = "SELECT * FROM data_sessions";
        con.query(sql, function (err, datasessions_list) {
            if (err) throw err;
            socket.emit('datasessions', datasessions_list);    
        });
        
        
    })

    //DELETE PATIENT DATABASE
    socket.on('deleted_patient', function(iddeleted) {
        var sql = "DELETE FROM tabla_pacientes WHERE idtabla_pacientes="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Deleted Patient");
        });
    });

    //EDIT PATIENT DATABASE
    socket.on('edit_patient', function(editpat) {
        var sql = 'UPDATE tabla_pacientes SET NombrePaciente = ?, ApellidoPaciente = ?  WHERE (idtabla_pacientes=?)'
        con.query(sql,[editpat.NombrePaciente,editpat.ApellidoPaciente,editpat.idtabla_pacientes], function (err, result) {
            console.log("Edited Patient");
        });
    });
    // ADD PATIENT IN DATABASE
    socket.on('insertPatient', function(patient) {
        var sql = "INSERT INTO tabla_pacientes (NombrePaciente, ApellidoPaciente, patiente_age, patiente_weight, leg_length, estado_fisico, estado_cognitivo, surgery, hip_joint) VALUES (?)";
        con.query(sql,[patient], function (err, result) {
            if (err) throw err;
            console.log("1 record Patient");
        });
    });

    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('download_patients',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');
        worksheet.columns = [
            { header: 'Id Patient', key: 'idtabla_pacientes', width: 10 },
            { header: 'First Name', key: 'NombrePaciente', width: 10 },
            { header: 'Last Name', key: 'ApellidoPaciente', width: 10 },
            { header: 'Age', key: 'patiente_age', width: 10 },
            { header: 'Weight (kg)', key: 'patiente_weight', width: 10 },
            { header: 'Leg Lenth (cm)', key: 'leg_length', width: 10 },
            { header: 'Physical Status', key: 'estado_fisico', width: 10 },
            { header: 'Cognitive Status', key: 'estado_cognitivo', width: 10 },
            { header: 'Type of Surgery', key: 'surgery', width: 10 },
            { header: 'Affected Hip Joint', key: 'hip_joint', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_pacientes";
        con.query(sql, function (err, patients_list) {
            if (err) throw err;
            datitos=patients_list;
                for (var i = 0; i < patients_list.length; i++) {
                    worksheet.addRow((patients_list[i]));
                }
            workbook.xlsx.writeFile("Patients_DB.xlsx");
        });
    })

    // ADD THERAPIST IN DATABASE
    socket.on('insertTherapist', function(therapist) {
        var sql = "INSERT INTO tabla_terapeutas (NombreTerapeuta, ApellidoTerapeuta, Centro) VALUES (?)";
        con.query(sql,[therapist], function (err, result) {
            if (err) throw err;
            console.log("1 record Therapist");
        });
    });

    //EDIT THERAPIST DATABASE
    socket.on('edit_therapist', function(editpat) {
        var sql = 'UPDATE tabla_terapeutas SET NombreTerapeuta = ?, ApellidoTerapeuta = ?, Centro = ?  WHERE (idtabla_terapeutas=?)'
        con.query(sql,[editpat.NombreTerapeuta,editpat.ApellidoTerapeuta, editpat.Centro,editpat.idtabla_terapeutas], function (err, result) {
            console.log("Edited therapist");
        });
    });

    //DELET THERAPIST DATABASE
    socket.on('deleted_therapist', function(iddeleted) {
        var sql = "DELETE FROM tabla_terapeutas WHERE idtabla_terapeutas="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Delet Therapist");
        });
    });

    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('download_therapist',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Therapists');
        worksheet.columns = [
            { header: 'Id Therapist', key: 'idtabla_terapeutas', width: 10 },
            { header: 'First Name', key: 'NombreTerapeuta', width: 10 },
            { header: 'Last Name', key: 'ApellidoTerapeuta', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_terapeutas";
        con.query(sql, function (err, therapist_list) {
            if (err) throw err;
                for (var i = 0; i < therapist_list.length; i++) {
                    worksheet.addRow((therapist_list[i]));
                }
            workbook.xlsx.writeFile("Therapists_DB.xlsx");
        });
    })

    // ADD SESSIONS DATA IN DATABASE
    socket.on('addsesiondata', function(data) {
        
        console.log("Add session data")
        var sql = "INSERT INTO tabla_sesion (idPaciente, NumberSession, idTerapeuta, gait_velocity, observations) VALUES (?)";
        // Read therapy configuration from conf file
        fs.readFile(therapyConfigPath, (err, data) => {
            if (err) throw err;
            var config = JSON.parse(data);
            var terapist_id = "SELECT idtabla_terapeutas from tabla_terapeutas where NombreTerapeuta in ('" + (config.therapist_name.split(" "))[0] +"') AND ApellidoTerapeuta in ('" + (config.therapist_name.split(" "))[1] +"'); ";
            var patient_id = "SELECT idtabla_pacientes from tabla_pacientes where NombrePaciente in ('" + (config.patient_name.split(" "))[0] +"') AND ApellidoPaciente in ('" + (config.patient_name.split(" "))[(config.patient_name.split(" ").length) -1] +"'); ";
            var IDs = terapist_id + patient_id
            con.query(IDs , [1,2], function (err, result) {
                if (err) throw err;
                patient_id = result[1][0].idtabla_pacientes;
                terapist_id = result[0][0].idtabla_terapeutas;
                patient_leg_length = config.leg_length;
                var n_session = "SELECT COUNT(NumberSession) AS count from tabla_sesion WHERE idPaciente =" + patient_id + ";"
                con.query(n_session, function (err, result) {
					if (err) throw err;
					n_session = result[0].count +1;
			
					var sessionConfig = [patient_id, n_session, terapist_id, config.gait_velocity, config.observations];
					
					var surgery = config.surgery;
					con.query(sql,[sessionConfig], function (err, result) {
						if (err) throw err;
						// Save Data of the session
						var sessionID = "SELECT idtable_session from tabla_sesion ORDER BY idtable_session DESC LIMIT 1;";
						con.query(sessionID , function (err, sessionID) {
							if (err) throw err;
							// Get last session ID
							sessionID = sessionID[0].idtable_session;
							// Prepare joints angles data of the last session
							var insertDataRows = ""
							if (is_swalker_connected){
								var total_length = rom_right_vector.length;
							} else if (is_delsys_connected){
								var total_length = emg_activity_vector.length;
							} 
							
							for (let index = 0; index < total_length; index++) {
								if(is_swalker_connected){
									if (direction_vector[index] == 's'){
										var dir_vector =  0;
									} else if (direction_vector[index] == 'b'){
										var dir_vector = 1;
									} else if (direction_vector[index] == 'f'){
										var dir_vector = 2;
									} else if (direction_vector[index] == 'r'){
										var dir_vector = 3;
									} else if (direction_vector[index] == 'l'){
										var dir_vector = 4;
									} else {
										var dir_vector = 5;
									}
								}    
																
								if ((is_swalker_connected & is_delsys_connected)) {
									
									insertDataRows = "(" + (sessionID).toString() + "," + (time_stamp_vector[index]).toString() +","+ 
													(rom_left_vector[index]).toString() + "," + (rom_right_vector[index]).toString()  + "," + (load_vector[index]).toString() + "," + (dir_vector).toString() +  "," + 
													(emg_activity_vector[index][0]).toString() + "," + (emg_binary_activation_vector[index][0]).toString() + "," + (emg_activity_vector[index][1]).toString() + "," + (emg_binary_activation_vector[index][1]).toString() +  "," + (emg_activity_vector[index][2]).toString()  + "," + (emg_binary_activation_vector[index][2]).toString()+  "," + (emg_activity_vector[index][3]).toString()  + "," + (emg_binary_activation_vector[index][3]).toString() +  "," + (emg_activity_vector[index][4]).toString()  + "," + (emg_binary_activation_vector[index][4]).toString() +  "," + (emg_activity_vector[index][5]).toString()  + "," + (emg_binary_activation_vector[index][5]).toString() +  "," + (emg_activity_vector[index][6]).toString()  + "," + (emg_binary_activation_vector[index][6]).toString()+  "," + (emg_activity_vector[index][7]).toString()  + "," + (emg_binary_activation_vector[index][7]).toString() + 
													"," + tibiaL_accX_vector[index].toString() + "," + tibiaL_accY_vector[index].toString() + "," + tibiaL_accZ_vector[index].toString() + "," + tibiaR_accX_vector[index].toString() + "," + tibiaR_accY_vector[index].toString() + "," + tibiaR_accZ_vector[index].toString() + ");"
									var sql = "INSERT INTO data_sessions (idSesion, Date, left_hip, right_hip, weight_gauge, direction, emg_muscle_activity_s1,  muscle_binary_activation_s1, emg_muscle_activity_s2,  muscle_binary_activation_s2, emg_muscle_activity_s3,  muscle_binary_activation_s3,  emg_muscle_activity_s4,  muscle_binary_activation_s4,  emg_muscle_activity_s5,  muscle_binary_activation_s5, emg_muscle_activity_s6,  muscle_binary_activation_s6, emg_muscle_activity_s7,  muscle_binary_activation_s7, emg_muscle_activity_s8, muscle_binary_activation_s8, accX_s7, accY_s7, accZ_s7, accX_s3, accY_s3, accZ_s3) VALUES " + insertDataRows;
									
									
								
								
								} else if(is_delsys_connected){
								
									// emg connected. No swalker.
									insertDataRows = "(" + (sessionID).toString() + "," + (time_stamp_vector[index]).toString() +","+ 
													(emg_activity_vector[index][0]).toString() + "," + (emg_binary_activation_vector[index][0]).toString() + "," + (emg_activity_vector[index][1]).toString() + "," + (emg_binary_activation_vector[index][1]).toString() +  "," + (emg_activity_vector[index][2]).toString()  + "," + (emg_binary_activation_vector[index][2]).toString()+  "," + (emg_activity_vector[index][3]).toString()  + "," + (emg_binary_activation_vector[index][3]).toString() +  "," + (emg_activity_vector[index][4]).toString()  + "," + (emg_binary_activation_vector[index][4]).toString() +  "," + (emg_activity_vector[index][5]).toString()  + "," + (emg_binary_activation_vector[index][5]).toString() +  "," + (emg_activity_vector[index][6]).toString()  + "," + (emg_binary_activation_vector[index][6]).toString()+  "," + (emg_activity_vector[index][7]).toString()  + "," + (emg_binary_activation_vector[index][7]).toString() + 
													"," + tibiaL_accX_vector[index].toString() + "," + tibiaL_accY_vector[index].toString() + "," + tibiaL_accZ_vector[index].toString() + "," + tibiaR_accX_vector[index].toString() + "," + tibiaR_accY_vector[index].toString() + "," + tibiaR_accZ_vector[index].toString() + ");"

									var sql = "INSERT INTO data_sessions (idSesion, Date, emg_muscle_activity_s1,  muscle_binary_activation_s1, emg_muscle_activity_s2,  muscle_binary_activation_s2, emg_muscle_activity_s3,  muscle_binary_activation_s3,  emg_muscle_activity_s4,  muscle_binary_activation_s4,  emg_muscle_activity_s5,  muscle_binary_activation_s5, emg_muscle_activity_s6,  muscle_binary_activation_s6, emg_muscle_activity_s7,  muscle_binary_activation_s7, emg_muscle_activity_s8, muscle_binary_activation_s8, accX_s7, accY_s7, accZ_s7, accX_s3, accY_s3, accZ_s3) VALUES " + insertDataRows;
									
									
								} else if (is_swalker_connected){
									
									// swalker connected. No emg .

										insertDataRows = "(" + (sessionID).toString() + "," + (time_stamp_vector[index]).toString() +","+ 
														(rom_left_vector[index]).toString() + "," + (rom_right_vector[index]).toString()  + "," + (load_vector[index]).toString() + "," + (dir_vector).toString()  + ");"
										var sql = "INSERT INTO data_sessions (idSesion, Date, left_hip, right_hip, weight_gauge, direction) VALUES " + insertDataRows;
									
									
								
								}
								//console.log(sql);
								con.query(sql, function (err, result) {
									
									if (err) throw err;
								});
							}
							console.log("Recorded Session Data");
							socket.emit("monitoring:recorded_sessionData");
						});
					});
			   });
           });

        })
    });

    //DELETE SESSION FROM DATABASE
    socket.on('deleted_session', function(iddeleted) {
        var sql_sessions = "DELETE FROM tabla_sesion WHERE idtable_session="+iddeleted;
        var sql_data = "DELETE FROM data_sessions WHERE idSesion="+iddeleted;
        con.query(sql_sessions, function (err, result) {
            console.log("Delet Session");
        });
        con.query(sql_data, function (err, result) {
            console.log("Delet Data Session");
        });
    });

    //DOWNLOAD SESSIONS CONFIGURATION (DATABASE)
    socket.on('download_sessions_config',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session');
        worksheet.columns = [
            { header: 'Id Session', key: 'idtable_session', width: 20 },
            { header: 'Date', key: 'Date', width: 10 },
            { header: 'Id Patient', key: 'idPaciente', width: 20 },
            { header: 'Number of session', key: 'NumberSession', width: 30 },
            { header: 'Id Therapist', key: 'idTerapeuta', width: 20 },
            { header: 'Gait Velocity', key: 'gait_velocity', width: 20 },
            { header: 'Observations', key: 'observations', width: 100 },
        ];
        var sql = "SELECT * FROM tabla_sesion";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
                for (var i = 0; i < sessions_data.length; i++) {
                    worksheet.addRow((sessions_data[i]));
                }
            workbook.xlsx.writeFile('Sessions_Configurations_data.xlsx');
        });
    })

    //DOWNLOAD SESSION DATA (DATABASE)
    socket.on('download_sessions_data',function(idsesion){
        console.log("Download Data")
        idsesion = idsesion;
        console.log(idsesion)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session');
        worksheet.columns = [
            { header: 'Id Data', key: 'iddata_Sessions', width: 10 },
            { header: 'Id Sesion', key: 'idSesion', width: 10 },
            { header: 'Time (ms)', key: 'Date', width: 10 },
            { header: 'Left Hip Real', key: 'left_hip', width: 10 },
            { header: 'Right Hip Real', key: 'right_hip', width: 10 },
            { header: 'Weigth Gauge', key: 'weight_gauge', width: 20 },
            { header: 'Direction', key: 'direction', width: 20 },
            { header: 'Right RF muscle activity', key: 'emg_muscle_activity_s1', width: 20 },
            { header: 'Right RF muscle activation (1/0)', key: 'muscle_binary_activation_s1', width: 30 },
            { header: 'Right LH muscle activity', key: 'emg_muscle_activity_s2', width: 20 },
            { header: 'Right LH muscle activation (1/0)', key: 'muscle_binary_activation_s2', width: 30 },
            { header: 'Right TA muscle activity', key: 'emg_muscle_activity_s3', width: 20 },
            { header: 'Right TA muscle activation (1/0)', key: 'muscle_binary_activation_s3', width: 30 },
            { header: 'Right MG muscle activity', key: 'emg_muscle_activity_s4', width: 20 },
            { header: 'Right MG muscle activation (1/0)', key: 'muscle_binary_activation_s4', width: 30 },
            { header: 'Left RF muscle activity', key: 'emg_muscle_activity_s5', width: 20 },
            { header: 'Left RF muscle activation (1/0)', key: 'muscle_binary_activation_s5', width: 30 },
            { header: 'Left LH muscle activity', key: 'emg_muscle_activity_s6', width: 20 },
            { header: 'Left LH muscle activation (1/0)', key: 'muscle_binary_activation_s6', width: 30 },
            { header: 'Left TA muscle activity', key: 'emg_muscle_activity_s7', width: 20 },
            { header: 'Left TA muscle activation (1/0)', key: 'muscle_binary_activation_s7', width: 30 },
            { header: 'Left MG muscle activity', key: 'emg_muscle_activity_s8', width: 20 },
            { header: 'Left MG muscle activation (1/0)', key: 'muscle_binary_activation_s8', width: 30 },
            { header: 'Left Tibia AccX', key: 'accX_s7', width: 30 },
            { header: 'Left Tibia AccY', key: 'accY_s7', width: 30 },
            { header: 'Left Tibia AccZ', key: 'accZ_s7', width: 30 },
            { header: 'Right Tibia AccX', key: 'accX_s3', width: 30 },
            { header: 'Right Tibia AccY', key: 'accY_s3', width: 30 },
            { header: 'Right Tibia AccZ', key: 'accZ_s3', width: 30 },
           

        ];
        var sql = "SELECT * FROM data_sessions WHERE idSesion=" + idsesion.toString() + ";";
        console.log(sql);
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
                for (var i = 0; i < sessions_data.length; i++) {
                    worksheet.addRow((sessions_data[i]));
                }
            data_session_id = idsesion.toString();
            workbook.xlsx.writeFile("Session_" + data_session_id + ".xlsx");
            socket.emit('open_download_sessions_link');
        });
    })

    //DOWNLOAD SESSION DATA (DATABASE)
    socket.on('load_session_data',function( idsesion){
        // store the ROM values for the summary
        var sql = "SELECT left_hip FROM data_sessions WHERE idSesion=" + idsesion.toString() + ";";
        con.query(sql, function (err, rom_left_data) {
            if (err) throw err;
            load_session_rom_left_objects = rom_left_data;
            for( var i = 0; i < load_session_rom_left_objects.length; i++ )  {
                load_session_rom_left.push(load_session_rom_left_objects[i].left_hip)
            }
            
        });
        // store the ROM values for the summary
        var sql = "SELECT right_hip FROM data_sessions WHERE idSesion=" + idsesion.toString() + ";";
        con.query(sql, function (err, rom_right_data) {
            if (err) throw err;
            load_session_rom_right_objects = rom_right_data;
            for( var i = 0; i < load_session_rom_right_objects.length; i++ )  {
                load_session_rom_right.push(load_session_rom_right_objects[i].right_hip)
            }            
        });
        
        // store the weight supported values for the summary
        var sql = "SELECT weight_gauge FROM data_sessions WHERE idSesion=" + idsesion.toString() + ";";
        con.query(sql, function (err, rom_right_data) {
            if (err) throw err;
            load_session_weight_gauge_objects = rom_right_data;
            for( var i = 0; i < load_session_rom_right_objects.length; i++ )  {
                load_session_weight_gauge.push(load_session_weight_gauge_objects[i].weight_gauge)
            }            
        });
        
        socket.emit('session_data_loaded', {
            rom_l: load_session_rom_left,
            rom_r: load_session_rom_right,
            load: load_session_weight_gauge
        })
        
        load_session_rom_right = []
        load_session_rom_left = []
        load_session_weight_gauge = []
    })

    app.get('/downloadsessionsconfig', (req, res) => setTimeout(function(){ res.download('./Sessions_Configurations_data.xlsx'); }, 1000))
    app.get('/downloadsessionsdata', (req, res) => setTimeout(function(){ res.download('./Session_' + data_session_id + '.xlsx'); }, 1000))
    app.get('/downloadtherapists', (req, res) => setTimeout(function(){ res.download('./Therapists_data.xlsx'); }, 1000))
    app.get('/downloadpatients', (req, res) => setTimeout(function(){ res.download('./Patients_DB.xlsx'); }, 1000))
    app.get('/downloadsessionsobjectives', (req, res) => setTimeout(function(){ res.download('./Sessions_Objectives_data.xlsx'); }, 1000))



    //GET PATIENT INFO AND AUTOFILL IN "Therapy Settings" (DATABASE)
    socket.on('get_patient_info',function(data){
        // Get patient ID from database
        var name = data.patient_name.split(" ")[0];
        var surname =  data.patient_name.split(" ")[(data.patient_name.split(" ").length -1 )];
        var patient_id = "";
        var sql_patient = "SELECT * FROM tabla_pacientes WHERE NombrePaciente='" + name.toString() + "' AND ApellidoPaciente='" + surname.toString() + "';";
        console.log(sql_patient);
        con.query(sql_patient, function (err, patient_data) {
            if (err) throw err;
            console.log(patient_data);
            patient_id = patient_data[0].idtabla_pacientes; 
            console.log(patient_data[0].idtabla_pacientes);
            if (patient_id =! undefined) {
                patient_id = patient_data[0].idtabla_pacientes;
               
				patient_age = patient_data[0].patiente_age; 
				patient_weight = patient_data[0].patiente_weight;
				global_patient_weight = patient_data[0].patiente_weight;
				patient_leg_length = patient_data[0].leg_length;
				patient_hip_joint = patient_data[0].hip_joint;
				var surgery = patient_data[0].surgery;
				var estado_fisico = patient_data[0].estado_fisico;
				var estado_cognitivo = patient_data[0].estado_cognitivo;
				console.log("patient_age: " + patient_age.toString() + " patient_weight: " + patient_weight.toString());
				socket.emit('set_patient_info', {
					patient_age: patient_age,
					patient_weight: patient_weight,
					patient_leg_length: patient_leg_length,
					patient_hip_joint: patient_hip_joint,
					patient_surgery: surgery,
					estado_fisico: estado_fisico,
					estado_cognitivo: estado_cognitivo,
					
				})

			}
                
        });
    })
    
    // *****   GAMES DATABASE INTERACTIONS   ****
    // ******************************************
    
    socket.on('games:refreshlist',function() {
        console.log("Connected to weriumGames!");
        var sql = "SELECT * FROM tabla_sesiones JOIN tabla_usuarios ON tabla_sesiones.id_usuario = tabla_usuarios.id_usuario" 
        con_games.query(sql, function (err, sessions_data) {
            if (err) throw err;
            socket.emit('games:datos_configuraciones', sessions_data);   	//session_data---- datos de las sesiones (configuraciones)
        });
        console.log("Connected Patient!");
        var sql = "SELECT * FROM tabla_usuarios";
        con_games.query(sql, function (err, patients_list) {
            if (err) throw err;
            socket.emit('games:datos_usuarios', patients_list);  	//patients_list ----- lista de usuarios
        });
        
    })
    
    //GET PATIENT INFO AND AUTOFILL IN "Therapy Settings" (DATABASE)
    socket.on('games:get_user_info',function(data){
        // Get patient ID from database
        var name = data.patient_name.split(" ")[0];
        var surname =  data.patient_name.split(" ")[(data.patient_name.split(" ").length -1 )];
        var patient_id = "";
        var sql_patient = "SELECT * FROM tabla_usuarios WHERE nombre_usuario='" + name.toString() + "' AND apellido_usuario='" + surname.toString() + "';";
        console.log(sql_patient);
        con_games.query(sql_patient, function (err, sessions_data) {
            if (err) throw err;
            id_user_playing = sessions_data[0].id_usuario; 
            console.log(id_user_playing);

        });
    });

    //DELETE PATIENT DATABASE
    socket.on('games:delete_user', function(iddeleted) {
        var sql = "DELETE FROM tabla_usuarios WHERE id_usuario="+iddeleted;
        con_games.query(sql, function (err, result) {
			if (err) throw err;
            console.log("Paciente eliminado");
        });
    });

    //EDIT PATIENT DATABASE
    socket.on('games:edit_user', function(editpat) {
        var sql = 'UPDATE tabla_usuarios SET nombre_usuario = ?, apellido_usuario = ?,  edad = ?,  sexo = ?  WHERE (id_usuario=?)'
        con_games.query(sql,[editpat.nombre_usuario,editpat.apellido_usuario,editpat.edad, editpat.sexo, editpat.id_usuario], function (err, result) {
			if (err) throw err;
            console.log("Edited Patient");
        });
    });
    // ADD PATIENT IN DATABASE
    socket.on('games:add_user', function(patient) {
        var sql = "INSERT INTO tabla_usuarios (nombre_usuario, apellido_usuario, edad, sexo) VALUES (?)";
        con_games.query(sql,[patient], function (err, result) {
            if (err) throw err;
            console.log("1 record Patient");
        });
    });

    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('games:download_users_list',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');
        worksheet.columns = [
            { header: 'Id Usuario', key: 'id_usuario', width: 10 },
            { header: 'Nombre', key: 'nombre_usuario', width: 10 },
            { header: 'Apellido', key: 'apellido_usuario', width: 10 },
            { header: 'Edad', key: 'edad', width: 10 },
            { header: 'Sexo', key: 'sexo', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_usuarios";
        con_games.query(sql, function (err, patients_list) {
            if (err) throw err;
            datitos=patients_list;
                for (var i = 0; i < patients_list.length; i++) {
                    worksheet.addRow((patients_list[i]));
                }
            workbook.xlsx.writeFile("Patients_DB.xlsx");
        });
    })

    //DELETE SESSION FROM DATABASE
    socket.on('games:delete_sesion', function(iddeleted) {
        var sql_sessions = "DELETE FROM tabla_sesiones WHERE idsesion="+iddeleted;
        var sql_data = "DELETE FROM tabla_angulos WHERE id_sesion="+iddeleted;
        con_games.query(sql_sessions, function (err, result) {
            console.log("Delet Session");
        });
        con_games.query(sql_data, function (err, result) {
            console.log("Delet Data Session");
        });
    });

    //DOWNLOAD SESSIONS CONFIGURATION (DATABASE)
    socket.on('games:download_sessions_config',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session');
        worksheet.columns = [
            { header: 'Id Session', key: 'id_sesion', width: 20 },
            { header: 'Id Usuario', key: 'id_usuario', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Numero de Sesion', key: 'numero_sesion', width: 20 },
            { header: 'Juego', key: 'juego', width: 30 },
            { header: 'Numero de Objetivos', key: 'numero_objetivos', width: 20 },
            { header: 'Articulacion', key: 'articulacion', width: 10 },
            { header: 'Lado', key: 'lado', width: 10 },
            { header: 'Eje', key: 'eje', width: 10 },
            { header: 'Movimiento', key: 'movimiento', width: 10 },
            { header: 'Horiontal Max', key: 'horizontalmax', width: 10 },
            { header: 'Horizontal Min', key: 'horizontalMin', width: 10 },
            { header: 'Vertical MAX', key: 'verticalMax', width: 10 },
            { header: 'Vertical MIN', key: 'verticalMin', width: 10 },
        ];
        var sql = "SELECT * FROM tabla_sesiones";
        con_games.query(sql, function (err, sessions_data) {
            if (err) throw err;
                for (var i = 0; i < sessions_data.length; i++) {
                    worksheet.addRow((sessions_data[i]));
                }
            workbook.xlsx.writeFile('Sessions_Configurations_data.xlsx');
        });
    })
    
    //DOWNLOAD SESSIONS OBJECTIVES (DATABASE)
    socket.on('games:download_sessions_objectives',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session');
        worksheet.columns = [
            { header: 'Id. Sesión', key: 'id_sesion', width: 10 },
            { header: 'Objetivo', key: 'n_objetivo', width: 10 },
            { header: 'Angulo X', key: 'angulo_x', width: 10 },
            { header: 'Angulo Y', key: 'angulo_y', width: 10 },
            { header: 'Posición X', key: 'posicion_x', width: 10 },
            { header: 'Posición Y', key: 'posicion_y', width: 10 },
            { header: 'Posición Z', key: 'posicion_z', width: 10 },
            { header: 'Tiempo de Alcance', key: 'tiempo', width: 20 },
            { header: 'Alcanzdo', key: 'alcanzado', width: 20 },
        ];
        var sql = "SELECT * FROM tabla_objetivos";
        con_games.query(sql, function (err, sessions_data) {
            if (err) throw err;
                for (var i = 0; i < sessions_data.length; i++) {
                    worksheet.addRow((sessions_data[i]));
                }
            workbook.xlsx.writeFile('Sessions_Objectives_data.xlsx');
        });
    })

    //DOWNLOAD SESSION DATA (DATABASE)
    socket.on('games:download_angles_data',function( idsesion){
        console.log("Download Data")
        idsesion = idsesion;
        console.log(idsesion)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Session');
        worksheet.columns = [
            { header: 'Id Registro', key: 'id_registro', width: 10 },
            { header: 'Id Sesion', key: 'id_sesion', width: 10 },
            { header: 'Time (ms)', key: 'Date', width: 10 },
            { header: 'Grados Flexion', key: 'grados_flecion', width: 10 },
            { header: 'Grados Rotacion', key: 'grados_rotacion', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_angulos WHERE id_sesion=" + idsesion.toString() + ";";
        con_games.query(sql, function (err, sessions_data) {
            if (err) throw err;
                for (var i = 0; i < sessions_data.length; i++) {
                    worksheet.addRow((sessions_data[i]));
                }
            data_session_id = idsesion.toString();
            workbook.xlsx.writeFile("Session_" + data_session_id + ".xlsx");
            socket.emit('open_download_sessions_link');
        });
    })
    
    // Move the platform manualy. Listen traction:message events
    // and send UDP data to the platform (called in move.js)

    socket.on('traction:message', (data) => {
		//Get command value
		direction_char  = data.direction_char;
		speed_char = therapy_speed;
		if (therapy_speed == "high"){
			speed_char = 'f';
		} else if (therapy_speed == 'slow'){
			speed_char = 's';
		} else{
			speed_char = 'n';
		}

		var cmd = ''
		//Command var to send
		if (direction_char == 'b' | direction_char == 'f'){
			cmd = '#'+ direction_char + speed_char;
		} else {
			cmd = '#'+ direction_char;
		}

		//send command cmd to swalker
		console.log(cmd)
		var buf = Buffer.from(cmd, 'utf8');
		serial_swalker.write(buf)
		.then(() => console.log('Data successfully written'))
		.catch((err) => console.log('Error while sending command to SWALKERII', err))
    })

    // Send data to the charts in therapy monitoring
    setInterval(function () {
        socket.emit('monitoring:jointData', {
            // SWALKER
            swalker_connection_status: is_swalker_connected,
            load: load,
            rom_right: (rom_right - rom_right_calibration),
            rom_left: (rom_left - rom_left_calibration),
            // EMG
            emg: emg_msg,
            emg_connection_status: is_delsys_connected,
        })
    }, PLOTSAMPLINGTIME);

    // Save therapy settings in a JSON file.
    socket.on('settings:save_settings', (data) => {
		console.log("save_Settings");
        fs.writeFileSync(therapyConfigPath, JSON.stringify(data), function (err){
            if (err) throw err;
            console.log('Therapy settings saved!')
        })
    })

    // Configure the robot.
    socket.on('monitoring:right_hs', function(callbackFn) {
        client_delsys_start.write('#rHs');
    });

    // Configure the robot.
    socket.on('monitoring:left_hs', function(callbackFn) {
        client_delsys_start.write('#lHs');
    });

    // Show therapy settings in the monitoring screen.
    socket.on('monitoring:ask_therapy_settings', function(callbackFn) {
        // Read therappy settings from config file.
        fs.readFile(therapyConfigPath, (err, data) => {
            if (err) throw err;
            let config = JSON.parse(data);
            console.log(config);
            console.log(config.gait_velocity)
            therapy_speed = config.gait_velocity;
			patient_leg_length = config.leg_length;
            // Send values
            socket.emit('monitoring:show_therapy_settings', {
                patient_name : config.patient_name,
                patient_age : config.patient_age,
                patient_weight :  config.patient_weight,
                gait_velocity :   config.gait_velocity,
                pbws :   config.pbws,
                leg_length: config.leg_length
            })
        });
    });

    socket.on('deleted_patient', function(iddeleted) {
        console.log(iddeleted);
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "mysql",
            database: "swdb",
            multipleStatements: true
          });
            con.connect(function(err) {
                if (err) throw err;
                console.log("Eliminado");

            });
    });

    // Configure the robot.
    socket.on('monitoring:configure_robot', function(callbackFn) {
        console.log("monitoring:configure_robot");
        configureStartPos();
    });

    // Connect SWalker
    socket.on('monitoring:connect_swalker', function(callbackFn) {
        connect_bt_device(socket, serial_swalker, is_swalker_connected, "sw");

    });
    // Disconnect SWalker
    socket.on('monitoring:disconnect_swalker', function(callbackFn) {
        // Reset all vectors
        load_vector = []
        rom_right_vector = []
        rom_left_vector = []

        disconnect_bt_device(socket, serial_swalker, is_swalker_connected, "sw");

    });
    
    // Connect IMU 1
    const open = false
    socket.on('monitoring:connect_imu1', function(callbackFn) {
		console.log(is_imu1_connected);
        connect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");

    });
    // Disconnect IMU 1
    socket.on('monitoring:disconnect_imu1', function(callbackFn) {
        // Reset all vectors
        imu1_yaw_vector = []
        imu1_pitch_vector = []
        imu1_roll_vector = []

       disconnect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");
       
    });
/*
    // Connect IMU 2
    socket.on('monitoring:connect_imu2', function(callbackFn) {
		console.log(is_imu2_connected)
        connect_bt_device(socket, serial_imu2, is_imu2_connected, "imu2");
    });
    // Disconnect IMU 2
    socket.on('monitoring:disconnect_imu2', function(callbackFn) {
        // Reset all vectors
        imu2_yaw_vector = []
        imu2_pitch_vector = []
        imu2_roll_vector = []

        disconnect_bt_device(socket, serial_imu2, is_imu2_connected, "imu2");
    });
    
    // Connect IMU 3
    socket.on('monitoring:connect_imu3', function(callbackFn) {
		console.log(is_imu3_connected)
        connect_bt_device(socket, serial_imu3, is_imu3_connected, "imu3");
    });
    // Disconnect IMU 3
    socket.on('monitoring:disconnect_imu3', function(callbackFn) {
        // Reset all vectors
        imu3_yaw_vector = []
        imu3_pitch_vector = []
        imu3_roll_vector = []

        disconnect_bt_device(socket, serial_imu3, is_imu3_connected, "imu3");
    });

/
    // Disconnect IMUS
    socket.on('monitoring:disconnect_imus', function(callbackFn) {
			imu1_yaw_vector = imu1_pitch_vector = imu1_roll_vector = []
			disconnect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");

			imu2_yaw_vector = imu2_pitch_vector = imu2_roll_vector = []
			disconnect_bt_device(socket, serial_imu2, is_imu2_connected, "imu2");
			
			imu3_yaw_vector = imu3_pitch_vector = imu3_roll_vector = []
			disconnect_bt_device(socket, serial_imu3, is_imu3_connected, "imu3");
		
    });
    * */

    // Connect EMG
    socket.on('monitoring:connect_emg', function(callbackFn) {
	    if (!is_delsys_connected) {
			
			// start port
	        client_delsys_start.connect(DELSYS_START_PORT, DELSYS_PC_IP, function() {
	            console.log('Connected to start');
	        });  
            // 0: connected (no error), 1: connection error, 2: connection close
            client_delsys_start.on('error', function(ex) {
                console.log(ex);
                socket.emit('monitoring:connection_status', {
                    device: "emg",
                    // status--> 0: connect, 1: disconnect, 2: not paired, 3: conn error, 4: conn closed
                    status: 3
                }) 
            });  
            client_delsys_start.on('end', function() {
                console.log('Delsys start ended');
            });
            client_delsys_start.on('close', function() {
                console.log('Delsys start closed');
                socket.emit('monitoring:connection_status', {
                    device: "emg",
                    // status--> 0: connect, 1: disconnect, 2: not paired, 3: conn error, 4: conn closed
                    status: 4
                }) 
            });   
	            
	        // EMG data port
	        client_delsys_data.connect(DELSYS_DATA_PORT, DELSYS_PC_IP, function() {
                console.log('Connected to data');
                client_delsys_start.write('#startStream');

                is_delsys_connected = true;

                socket.emit('monitoring:connection_status', {
                    device: "emg",
                    // status--> 0: connect, 1: disconnect, 2: not paired, 3: conn error, 4: conn closed
                    status: 0
                }) 

            }); 
            client_delsys_data.on('error', function(ex) {
                console.log(ex);
                connect_delsys = false;
            });
            client_delsys_data.on('end', function() {
                console.log('Delsys data ended');
            });
            client_delsys_data.on('close', function() {
                console.log('Delsys data closed');
            });
            
            // AUX Acc data port
            client_delsys_acc.connect(delsys_acc_port, DELSYS_PC_IP, function() {
                console.log('Connected to acc');

            }); 
            client_delsys_acc.on('error', function(ex) {
                console.log(ex);
                connect_delsys = false;
            });
            client_delsys_acc.on('end', function() {
                console.log('Delsys acc ended');
            });
            client_delsys_acc.on('close', function() {
                console.log('Delsys acc closed');
            });
	    }
    });
    // Disconnect EMG
    socket.on('monitoring:disconnect_emg', function(callbackFn) {
    	if(is_delsys_connected) {
            console.log("----------------STOP_RECORD--------------------");
            client_delsys_start.write('#stopStream');
        }
		client_delsys_start.destroy();
		client_delsys_data.destroy();
		client_delsys_acc.destroy();
		is_delsys_connected = false;
        socket.emit('monitoring:connection_status', {
            device: "emg",
            // status--> 0: connect, 1: disconnect, 2: not paired, 3: conn error, 4: conn closed
            status: 1
        }) 
    });

    // Flag to emg acquisition program to save the raw data
    socket.on('monitoring:save_emg', function(callbackFn) {
    	if(is_delsys_connected) {
            console.log("----------------Save data--------------------");
            client_delsys_start.write('#record');
        }
    });

    socket.on('monitoring:connect_vr', function(callbackFn) {
        // The UDP network is used to communicate with oculus quest.
        // The predicted stride length will be send through this socket to feed the VR environment.
        // UPD sockets to send data
        
        if (is_client_connected){
           socket.emit('monitoring:connection_status',{
               device: "vr",
               status:0});
           vr_ready = true;
           sockets["conVR"].write(patient_leg_length.toString(), function(){
					console.log("leg length sent");
					});
				
        }else{
           socket.emit('monitoring:connection_status',{
             device: "vr",
             status:1})
            }
    });

    socket.on('monitoring:disable_vr', function(callbackFn) {
        //udpServer_VR_.close();
        vr_ready = false;
        socket.emit('monitoring:connection_status', {
            device: "vr",
            // status--> 0: connect, 1: disconnect, 2: not paired, 3: conn error, 4: conn closed
            status: 1
        }) 
    });
    // Start therapy.
    socket.on('monitoring:start', function(callbackFn) {

        // Reset all vectors
        time_stamp_vector = [];
        // SWALKER
        load_vector = [];
        rom_right_vector = [];
        rom_left_vector = [];
        // EMG
        emg_activity_vector = [];
        emg_binary_activation_vector = [];
        // ACC
        tibiaR_accX_vector = [];
        tibiaR_accY_vector = [];
        tibiaR_accZ_vector = [];
        tibiaR_accX = 0;
        tibiaR_accY = 0;
        tibiaR_accZ = 0;
        tibiaL_accX_vector = [];
        tibiaL_accY_vector = [];
        tibiaL_accZ_vector = [];
        tibiaL_accX = 0;
        tibiaL_accY = 0;
        tibiaL_accZ = 0;

        // Start recording
        record_therapy = true;

        if(is_delsys_connected) {
            console.log("----------------RECORD--------------------");
            client_delsys_start.write('#start');
        }
    });

    // Stop therapy.
    socket.on('monitoring:stop', function(callbackFn) {

    	if(is_delsys_connected) {
            console.log("----------------STOP_RECORD--------------------");
            client_delsys_start.write('#stop');
        }
		if(is_swalker_connected){
			stopTherapy();
		}
        record_therapy = false;

        console.log("Duration of the therapy:" + ((time_stamp_vector[time_stamp_vector.length - 1] - time_stamp_vector[0]) / 1000.00 / 60.00).toString());

    });
    
    socket.on('games:mode_update', function(callbackFn) {
		console.log(callbackFn.mode)
		if (callbackFn.mode == 'sw'){
			mode_sw = true;
			mode_games = false;
		} else if (callbackFn.mode == 'games'){
			mode_sw = false;
			mode_games = true;
		}else {
			mode_sw = false;
			mode_games = false;
		}
	});


    // Connect IMU 1 GAMES
    socket.on('games:connect_imu1', function(callbackFn) {
		console.log(is_imu1_connected);
        connect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");
		console.log(is_imu1_connected);
    });
    // Disconnect IMU 1
    socket.on('games:disconnect_imu1', function(callbackFn) {
        // Reset all vectors
        imu1_yaw_vector = []
        imu1_pitch_vector = []
        imu1_roll_vector = []

        is_imu1_connected = disconnect_bt_device(socket, serial_imu1, is_imu1_connected, "imu1");
       
    });
});

//******** WebSocket for games communication ** 
//*********************************************

var alfa_vector = beta_vector = gamma_vector = pos_x_vector = pos_y_vector = pos_z_vector = [];
var id_current_session;

io_games.on('connection', (socket) => {
	
    console.log('new connection on 3001 (Games)');
    sockets['websocket_games'] = socket;
    
	
	// Send IMU data
    setInterval(function () {
		if (mode_games){
			if (is_imu1_connected){
				//console.log(dcm_msgData)
				socket.send(dcm_msgData);
			} else {
				socket.send('sensor not connected');
			}
		}
			
    }, GAMESSAMPLINGTIME);
    
    socket.on("message", (data) => {
		
		try {
		
			let receivedJSON = JSON.parse(data);

			if(receivedJSON.cabecera == 'games:config'){
				DDBB_addConfigData(receivedJSON);
			} else if (receivedJSON.cabecera == 'games:game_started'){
				if (receivedJSON.data == 'true'){
					record_therapy = true;
					// reset vectors
					alfa_vector = [];
					beta_vector = [];
					gamma_vector = [];
					pos_x_vector = [];
					pos_y_vector = [];
					pos_z_vector = [];
				} else {
					record_therapy = false;			
					DDBB_addSessionData()
				}	
				
			} else if (receivedJSON.cabecera == 'games:objetives'){
				DDBB_addObjectivesData(receivedJSON);
				
			} else {
				
				if(receivedJSON.alfa){
					storeAnglesData(receivedJSON);
				} else {
					console.log(receivedJSON);
				}
			}
			
		} catch(error) {
			console.log(data.toString());
			
		}
	});
	
});

function DDBB_addObjectivesData(objectives_data){
	
	// ADD OBJECTIVES DATA TO TABLA_OBJETIVOS IN WERIUMGAMES DATABASE
	let n_objetivo = objectives_data.n_objetivo;
	let angulo_x = objectives_data.gradosX;
	let angulo_y = objectives_data.gradosY;
	let posicion_x = objectives_data.posx;
	let posicion_y = objectives_data.posy;
	let posicion_z = objectives_data.posz;
	let tiempo_alcance = objectives_data.tiempo;
	let alcanzado = objectives_data.alcanzado;
	
	insertDataRows = "('" + (id_current_session).toString() + "','" + (n_objetivo).toString() + "','" + (angulo_x).toString() +"','"+ (angulo_y).toString() + "','" + (posicion_x).toString()  + "','" + (posicion_y).toString() + "','" + (posicion_z).toString() +  "','" + (tiempo_alcance).toString()  + "','" + (alcanzado).toString() + "');"
	var sql = "INSERT INTO tabla_objetivos (id_sesion, n_objetivo, angulo_x, angulo_y, posicion_x, posicion_y, posicion_z, tiempo, alcanzado) VALUES " + insertDataRows;
	con_games.query(sql, function (err, result) {	
		if (err) throw err;
	
	});
}
function DDBB_addSessionData(){
	
	// Add session data to tabla_angulos in weriumGames database
	console.log(alfa_vector.length);
	for (let index = 0; index < alfa_vector.length; index++) {
		
		insertDataRows = "(" + parseInt(id_current_session) + ",'" + (time_stamp_vector[index]).toString() +"'," + parseFloat(alfa_vector[index]) + "," + parseFloat(beta_vector[index]) + "," + parseFloat(gamma_vector[index]) + "," + parseFloat(pos_x_vector[index]) + "," +  parseFloat(pos_y_vector[index]) + "," + parseFloat(pos_z_vector) + ");"
		var sql = "INSERT INTO tabla_angulos (id_sesion, Date, alfa, beta, gamma, posX, posY, posZ) VALUES " + insertDataRows;
		con_games.query(sql, function (err, result) {
			if (err) throw err;
		});
	}	
}

function storeAnglesData(data){
	
	if (record_therapy){
		alfa_vector.push(data.alfa);
		beta_vector.push(data.beta);
		gamma_vector.push(data.gamma);
		pos_x_vector.push(data.posX);
		pos_y_vector.push(data.posY);
		pos_z_vector.push(data.posZ);
		time_stamp_vector.push(data.tiempo);
	}
}

function DDBB_addConfigData(config_data){
		
	// ADD CONFIG SESION DATA INTO TABLA_SESIONES IN WERIUMGAMES DATABASE
	let id_usuario = id_user_playing;
	let date = Date.now();
	// check number of session of the current user:
	let n_session = "SELECT COUNT(numero_sesion) AS count from tabla_sesiones WHERE id_usuario =" + id_user_playing + ";"
	con_games.query(n_session, function (err, result) {
		if (err) throw err;
		id_current_session = result[0].count +1;
		console.log("numero de sesion: " + id_current_session);
		
		let juego_ = config_data.juego.toString();
		let numero_objetivos = config_data.numeroObjetivos;
		let articulacion = config_data.articulacion;
		let lado = config_data.lado;
		let eje = config_data.eje;
		let velocidad = config_data.velocidad;
		let movimiento = config_data.movimiento;
		let horizontalMax = config_data.gradosX_der;
		let horizontalMin = config_data.gradosX_izq;
		let verticalMax = config_data.gradosY_der;
		let verticalMin = config_data.gradosY_der;
		
		insertDataRows = "(" + parseInt(id_user_playing) + ","+ parseInt(id_current_session) + "," + parseInt(juego_) + "," + parseInt(numero_objetivos) + "," + parseInt(articulacion) +  "," + parseInt(lado) + "," + parseInt(eje) + "," + parseInt(velocidad) + "," + parseInt(movimiento) + "," + parseInt(horizontalMax) +  "," + parseInt(horizontalMin) +  "," + parseInt(verticalMax) + "," + parseInt(verticalMin) + ");"
		var sql = "INSERT INTO tabla_sesiones (id_usuario, numero_sesion, juego, numero_objetivos, articulacion, lado, eje, velocidad, movimiento, horizontalMax, horizontalMin, verticalMax, verticalMin) VALUES " + insertDataRows;
		con_games.query(sql, function (err, result) {	
			if (err) throw err;
		});		
		
		id_current_session = "SELECT id_sesion from tabla_sesiones ORDER BY id_sesion DESC LIMIT 1;";
		con_games.query(id_current_session , function (err, sessionID) {
			if (err) throw err;
			// Get last session ID
			id_current_session= sessionID[0].id_sesion;
		});
	})
}

// Configure swalker to start the therapy. Set ROM calibration in stance position.
function configureStartPos(romR, romL) {
    console.log("ROM calibration");

    rom_left_calibration = rom_left;
    rom_right_calibration = rom_right;

}

// Stop therapy.
function stopTherapy() {
    console.log("Stop Therapy");
    
    // send command stop to swalker
    stopSwalker();

    rom_left_calibration = 0;
    rom_right_calibration = 0;
}

function stopSwalker(){
    //send command cmd to swalker
    var buf = Buffer.from("#s", 'utf8');
    serial_swalker.write(buf)
    .then(() => console.log('Data successfully written'))
    .catch((err) => console.log('Error', err))
}

function hex2a_general(hexx, items, lasthex, is_first_data) {
    var hex = hexx.toString();//force conversion
    var h_hashtag = 100;
    var message = [];
    var messages = []
    var error = 1;
    var newhex = "";
    
    if(is_first_data){
		is_first_data = false;
		//console.log("first_data")
		lasthex = "";
			
	} else {
    
		for (var i = 0; i < hex.length; i++){
			if (!(hex[i] == "\r" || hex[i] == "\n")){
				newhex += hex[i];
			}
		}
		
		newhex = lasthex + newhex;
		if (newhex.includes("#")){
			var splitted = newhex.split("#");
			for (let i =1 ; i < splitted.length; i++){
				if (splitted[i].length > 0){
					if(splitted[i].includes(',')){
						if (splitted[i].split(',').length == items){
							error = 0;
							var m = '#'+splitted[i]
							messages.push(m);
							lasthex = "";
						} else { 
							error = 1;
							lasthex = lasthex + splitted[i];
						}
					} 
				}		
			}

			if(error == 1){
				lasthex = newhex;
				
			} else {
				lasthex = "";
			}
		}
	
	}
	
	message.push(error);
	if (messages.length > 0){
		message.push(messages[0]);
	}else{
		message.push("");
	}
    message.push(lasthex);
    message.push(is_first_data)
   
    return message; 
}

// Acordarse de comandos #os y #of al start y stop therapy
// Acordarse de añadir datos
/*
async function findConnect_ble(mac_addr){
	const {bluetooth, destroy} = createBluetooth()
	const adapter = await bluetooth.defaultAdapter()
	await adapter.startDiscovery()

	const device = await adapter.waitDecive(mac_addr)
	console.log("got device", await device.getAddress(), await device.getName())
	await device.connect()
	const gattServer = await device.gatt()
	const service1 = await gattServer.getPrimaryService('49535343-fe7d-4ae5-8fa9-9fafd205e455')
	const characteristic1 = await service1.getCharacteristic('49535343-1e4d-4bd9-ba61-23c647249616')
	await characteristic1.startNotifications()
	await new Promise( done => {
		characteristic1.once('valuechanged', buffer => {
			console.log('subscription', buffer)
			done()
		})
	})
}

async function disconect_ble(object){
	await object.stopNotifications()
	destroy()
}
*/

var connected_PMSensors_addresses = [];
function connect_bt_device(socket, bt_object, status_boolean, str_device){
		
	if (!status_boolean){
		status_boolean = false;
		var deviceNotFound = true;
		var pairedDevices = bt_object.scan()
		.then(function(devices) {
			console.log("[Bt] Scanning devices ...");
			console.log(devices)
			
			// Check if the device is switch on and close to the raspberry
			for (let i = 0; i < devices.length; i++) {
				
				if(deviceNotFound){
					var device_name = devices[i].name;
					var device_address = devices[i].address;
							
					// case SWalker
					if ( str_device == 'sw'){
						if (devices[i].name == swBluetoothName){
							console.log("[Bt] Device found. Trying connection...")
							deviceNotFound = false;
						}
					// case sensors ProMotion 
					}else {
						if (device_name.substr(device_name.length -3) == "-PM"){
							if(!connected_PMSensors_addresses.includes(device_address)){
								deviceNotFound = false;
								connected_PMSensors_addresses.push(str_device);
								connected_PMSensors_addresses.push(device_address);
							}
						}
					}
					
					// Device found
					if(!deviceNotFound){
						bt_object.connect(device_address)
						.then(function() {
							console.log('[Bt] Bluetooth connection established with device name: ' + device_name)
							socket.emit('games:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 0
							})
							socket.emit('monitoring:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 0
							}) 
							if (str_device == "imu1"){
								is_imu1_connected = true;
							
							}else if(str_device == "sw"){
								is_swalker_connected = true;
							}
							
						})
						.catch(function(err) {
							// The device has not been found.
							var deviceNotFound = false;
							connected_PMSensors_addresses.pop(device_address);
							console.log('[Error] Device: ' + device_name , err);
							
							// message status in case GAMES interface
							socket.emit('games:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 1
							})
							// message status in case WALKERII interface
							socket.emit('monitoring:connection_status', {
								device: str_device,
								// status--> 0: connect, 1: disconnect, 2: not paired
								status: 1
							}) 
						})
					}
				}
			}
			
			// Device not found
			if(deviceNotFound){
				console.log("device not found!");
				// message status in case GAMES interface
				socket.emit('games:connection_status', {   
					device: str_device,
					// status--> 0: connect, 1: disconnect, 2: not paired/not found
					status: 2
				})
				// message status in case SWALKERII interface
				socket.emit('monitoring:connection_status', {
					device: str_device,
					// status--> 0: connect, 1: disconnect, 2: not paired/not found
					status: 2
				}) 
			
			} 
				
		});
		
	
		
	}else{
		console.log('[Bt] The device is already connected!')
		socket.emit('games:connection_status', {
			device: str_device,
			// status--> 0: connect, 1: disconnect, 2: not paired
			status: 0
		})
		socket.emit('monitoring:connection_status', {
			device: str_device,
			// status--> 0: connect, 1: disconnect, 2: not paired
			status: 0
		}) 
    }
	
}

function disconnect_bt_device(socket, bt_object, status_boolean, str_device){
    if (status_boolean){
		if (connected_PMSensors_addresses.includes(str_device)){
			let index = connected_PMSensors_addresses.indexOf(str_device);
			connected_PMSensors_addresses.splice(index+1, 1);
			connected_PMSensors_addresses.pop(str_device);
		}
		bt_object.close()
		.then(function() {
			console.log('[Bt] Bluetooth connection successfully closed ');
			status_boolean = false;
			socket.emit('monitoring:connection_status', {
					device: str_device,
					// status--> 0: connect, 1: error, 2: not paired, 3: disconnected
					status: 3
				}) 
		
		})
		.catch(function(err) {
			console.log('Connetion already close')
			
		})
	
		if (str_device == "imu1"){
			is_imu1_connected = false;
		} else if(str_device == "sw"){
			is_swalker_connected = false;
		}			
	}
	
}

function decodeFloat(buf1, last_index){
	let index_channel = last_index

	let posInBuf = 0;
	let len = Buffer.byteLength(buf1);
	
	while (posInBuf < (len/4)){
		var data = [buf1[posInBuf+3], buf1[posInBuf+2], buf1[posInBuf+1], buf1[posInBuf]];
		var buf = new ArrayBuffer(4);
		var view = new DataView(buf);
		//set bytes
		data.forEach(function(b,i){
			view.setUint8(i,b);
		});
		let float = view.getFloat32(0);
		
		posInBuf = posInBuf+4;
		
		if(record_therapy){
			if (index_channel  == 7){   //accx sensor 3
				tibiaR_accX = float
			} else if (index_channel == 8){
				tibiaR_accY = float;
			} else if (index_channel == 9){
				tibiaR_accZ = float
			} else if (index_channel ==19){
				tibiaL_accX = float
			} else if (index_channel == 20){
				tibiaL_accY = float
			} else if (index_channel == 21) {
				tibiaL_accZ = float
			} else if(index_channel == 48){
				index_channel = 0;
			}
		}
		
		index_channel ++
		
	}
	
	return last_index;
	
}


