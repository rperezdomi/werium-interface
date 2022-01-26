const socket = io();

//Call to database
socket.emit('refreshlist');
var patient_select = [];
var therapist_select = [];
var datapatients ={};
var datatherapists={};
socket.on('patientdata',function(datapatient){
    for (i = 0; i < datapatient.length; i++){
        let patient = datapatient[i].NombrePaciente +" " +datapatient[i].ApellidoPaciente;
        patient_select.push(patient);  
    }

    for(var i in patient_select)
    { 
        document.getElementById("patients-list").innerHTML += "<option value='"+patient_select[i]+"'>"+patient_select[i]+"</option>"; 
    }
    datapatients=datapatient;
})
socket.on('therapistdata',function(datatherapist){
    //console.log(datatherapist);
    for (i = 0; i < datatherapist.length; i++){
        let therapist = datatherapist[i].NombreTerapeuta +" " +datatherapist[i].ApellidoTerapeuta;
        therapist_select.push(therapist);
    }
 
    for(var i in therapist_select)
    { 
        document.getElementById("therapists-list").innerHTML += "<option value='"+therapist_select[i]+"'>"+therapist_select[i]+"</option>"; 
    }
    datatherapists=datatherapist;
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
        if  (document.getElementById("therapists-list").value == "no_choose" ||
             document.getElementById("patients-list").value == "no_choose") {   
                if  (document.getElementById("therapists-list").value == "no_choose") {
                    document.getElementById("empty_therapist").innerHTML = "Select a therapist or login a new one."
                }   
                if  (document.getElementById("therapists-list").value != "no_choose") {
                    document.getElementById("empty_therapist").innerHTML = ""
                }                 
                if (document.getElementById("patients-list").value == "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = "Select a patient or login a new one."
                } 
                if (document.getElementById("patients-list").value != "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = ""
                } 
        } else {
            var therapist_name = document.getElementById("therapists-list");
            var patient_name = document.getElementById("patients-list");
            document.getElementById("therapist-name").innerHTML = therapist_name.value;
            //document.getElementById("therapist_").innerHTML = therapist_name.value;
            document.getElementById("patient-name").innerHTML = patient_name.value;
            $('#myModal').modal('hide');
        }        
    };
   
    // Updates the value of the "gait_velocity" range input
    document.getElementById("gait_velocity").onclick = function() {
        var max_gait_vel = 0.6;
        var gait_velocity_percentage = document.getElementById("gait_velocity").value;
        var leg_length = document.getElementById("leg_length").value;
        document.getElementById("gait_velocity_value").innerHTML = (parseFloat(max_gait_vel) * (parseFloat(gait_velocity_percentage)/100)).toFixed(2).toString() + "(m/s)";     
        document.getElementById("gait_velocity_percentage").innerHTML = gait_velocity_percentage + "%";
    };

    // Updates the value of the "rom" range input
    document.getElementById("rom").onclick = function() {
        var rom = document.getElementById("rom").value;
        document.getElementById("rom_value").innerHTML = rom + "%";
    };

    // Updates the value of the "pbws" range input
    document.getElementById("pbws").onclick = function() {
        var pbws = document.getElementById("pbws").value;
        document.getElementById("pbws_value").innerHTML = pbws + "%";
    };

    // When the "save_settings" button is clicked, send all the configured parameters to the server 
    document.getElementById("save_settings").onclick = function() {
        // First click change colour
        if (document.getElementById("save_settings").value == "save_settings") {
            document.getElementById("save_settings").value = "continue";
            document.getElementById("save_settings").innerHTML = "Continue";
            document.getElementById("save_settings").style.background = "#4CAF50"; 
        // Second click send data
        } else if (document.getElementById("save_settings").value == "continue") {            
            // Send data to server
            var d = new Date();
            socket.emit('settings:save_settings', {
                date: d.getTime(),
                therapist_name: document.getElementById("therapists-list").value,
                patient_name: document.getElementById("patients-list").value,
                patient_age: document.getElementById("patient_age").value,
                weight: document.getElementById("weight").value,
                leg_length: document.getElementById("leg_length").value,
                hip_upper_strap: 0,
                knee_lower_strap: 0,
                gmfcs: document.getElementById("gmfcs").value,
                steps: document.getElementById("steps").value,
                gait_velocity: document.getElementById("gait_velocity").value,
                rom: document.getElementById("rom").value,
                pbws: document.getElementById("pbws").value,
                control_mode : document.getElementById("control_mode").value,               
                left_knee_config: document.getElementById("left_knee_config").value,
                right_knee_config: document.getElementById("right_knee_config").value,
                left_hip_config: document.getElementById("left_hip_config").value,
                right_hip_config: document.getElementById("right_hip_config").value,                
                observations: document.getElementById("observations").value
            })
            // Redirect to the therapy monitoring window
            location.replace("therapy_monitoring.html")
        }
    };
};