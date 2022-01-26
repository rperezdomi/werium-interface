//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

let sortDirection=false;

var data_right;
var data_left;
var total_time;
var load;

let personData=[
    {name: 'Gabriel', Apellido: 'Delgado'},
    {name: 'Miguel', Apellido: 'Andrade'},
    {name: 'Andres', Apellido: 'Abril'},
    
];

//let datospacientes = [{
 //   idPacientes: 4,
 //   NombrePac: 'Paciente4',
 //   ApellidoPac: 'Apellido4',
 //   EdadPac: '5',
 //   PesoPac: '4',
 //   TallaPac: '90',
 //   idTerapeuta: 2,
 //   SesionNum: 1
 // }];

  let datospacientes = [{
    idtabla_sesion: 4,
    date: '2020-12-22T15:49:59.000Z',
    idPaciente: 3,
    NumeroSesion: 1,
    idTerapeuta: 2,
    edad_paciente: 17,
    peso_paciente: 45,
    leg_length: 20,
    hip_upper_strap: 20,
    knee_lower_strap: 20,
    escala_clinica: '3',
    steps: 35,
    ROM: 50,
    cadence: 67,
    PBWS: 23,
    right_knee_config: 'posicion',
    left_knee_config: 'posicion',
    right_hip_config: 'impedancia 1',
    left_hip_config: 'impedancia 1',
    observaciones: 'triste',
    idtabla_pacientes: 3,
    NombrePaciente: 'María',
    ApellidoPaciente: 'Riveros',
    idtabla_terapeutas: 2,
    NombreTerapeuta: 'María',
    ApellidoTerapeuta: 'Jaramillo',
    Centro: 'CSIC'
  }];

  let listapacientes = [{
    idtabla_pacientes: 6,
    NombrePaciente: 'Gabriel',
    ApellidoPaciente: 'Delgado',
  }];

socket.on('session_data_loaded',function(data){

    console.log(data);
    data_right = data.rom_r;
    console.log(data_right);
    data_left = data.rom_l;
    load = data.load;
    
    
    
});


socket.emit('refreshlist');
var n_session;

socket.on('datasessions', function(datasessions) {
	var l_rom;
	var r_rom ;
	var load;
	$('#view_session').on('click', function() {
	l_rom = [];
	r_rom = [];
	load = [];
	
	for (i = 0; i < datasessions.length; i++) {
		if (datasessions[i].idSesion == n_session){
		   l_rom.push(datasessions[i].left_hip);
		   r_rom.push(datasessions[i].right_hip);
		   load.push(datasessions[i].weight_gauge);
		   
		};
	};
			
	var l_max = Math.max(...l_rom);
    var r_max = Math.max(...r_rom);
    console.log(r_max);
    var r_min = Math.min(...r_rom);
    var l_min = Math.min(...l_rom);
    
    
	// load
	let mean_load = 0;
	for (i=0; i<load.length;i++){
		mean_load = mean_load + load[i];
	}
	mean_load = Math.round(mean_load/load.length);
	
	if (r_rom.length != 0){
		document.getElementById("l_maxRom").innerHTML =  l_max + "º";
		document.getElementById("l_minRom").innerHTML =  l_min + "º";
		document.getElementById("r_maxRom").innerHTML =  r_max + "º";
		document.getElementById("r_minRom").innerHTML =  r_min + "º";
		document.getElementById("supported_weight").innerHTML =  mean_load + "%";

	} else {
		document.getElementById("l_maxRom").innerHTML =  "--";
		document.getElementById("l_minRom").innerHTML =  "--";
		document.getElementById("r_maxRom").innerHTML =  "--";
		document.getElementById("r_minRom").innerHTML =  "--";
		document.getElementById("supported_weight").innerHTML =  "--";
	}

    
	$("#modalviewsession").modal('show');

    
  }) 
  
  $('#modalviewsession').on('shown.bs.modal', function (event) {

	var ctxl = document.getElementById('l_hip_chart').getContext('2d');
	var ctxr = document.getElementById('r_hip_chart').getContext('2d');
	
	
    
    var commonJointsOptions = {
      font: {
        size: 16
      },
      scales: {
        xAxes: [{
		/*
          type: 'time',
          time: {
			parser: 'ss',
			unit: 'second',
			displayFormats:{
				second: 'ss'
			}	
          },
		 */
		  
		  
          scaleLabel: {
            fontSize: 18,
            display: true,
            labelString: 'Segundos (s)'
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
            max: 50,    // maximum will be 70, unless there is a lower value.
            min: -30,    // minimum will be -10, unless there is a lower value.
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
    var ctxrhipInstance = new Chart(ctxr, {
      type: 'line',
      data: {
        datasets: [{label: 'ROM',
          data: [],
          fill: false,
          borderColor: '#FF2626',
          borderWidth: 1.5,
          pointStyle: 'line'
        }],
        //labels: [total_time]
      },
      options: Object.assign({}, commonJointsOptions), 
    });
    
    console.log(ctxrhipInstance);
    
    var ctxlhipInstance = new Chart(ctxl, {
      type: 'line',
      data: {
        datasets: [{
          label: 'ROM',
          data: [],
          fill: false,
          borderColor: '#FF2626',
          borderWidth: 1.5,
          pointStyle: 'line'
        }],
        //labels: ['00-00-00', total_time]
      },
      options: Object.assign({}, commonJointsOptions),   
    });
    
    var time_labels = [];
    for (i=0; i< r_rom.length ; i++){
		var milisegundos = i/100*1000
		var segundos = milisegundos/1000
		var minutos = milisegundos/1000/60;
		//segundos = segundos - minutos*60;
		//milisegundos = milisegundos - segundos*60;
		total_time = Math.floor(segundos)
		ctxrhipInstance.data.labels.push(total_time)
		ctxrhipInstance.data.datasets[0].data.push(r_rom[i])
		ctxlhipInstance.data.labels.push(total_time)
		ctxlhipInstance.data.datasets[0].data.push(l_rom[i])
	}
	ctxrhipInstance.update();
	ctxlhipInstance.update();
	
	
}); 
	

});
	
socket.on('datostabla', function(datas) {


    //for (var i = 0; i < datas.length; i++) {
     //   datospacientes.push(datas[i]);
   // }
    console.log(datas);
    

    //Creación de DataTables
    let $dt = $('#sessionsList');
    let dt = $dt.DataTable({
        "data": datas,
        "columns": [
            {// Se ingresa el control para agregar columnas y observar mas detalles del paciente
                "className":      'details-control', // Se
                "orderable":      false,
                "data":           null,
                "width": '4%',
                "defaultContent":  ' <i class="fas fa-plus" style="color:#325AC8;" aria-hidden="true"></i>'  //ingreso el icono de más
            },
            {"width": '4%',
            render: function(data, type, fullsessions, meta) {
              // ACA controlamos la propiedad para des/marcar el input
              return "<input type='checkbox'" + (fullsessions.checked ? ' checked' : '') + "/>";
            },
            orderable: false
             },
            { data: 'date' },
            { data: 'NombrePaciente' },
            { data: 'ApellidoPaciente'},
            // data: 'gmfcs'},
            { data: 'NumberSession'},
            { data: 'NombreTerapeuta'},
            { data: 'ApellidoTerapeuta'},
            ],
            
    });

    // Cuando hacen click en el checkbox del thead
    $dt.on('change', 'thead input', function(evt) {
        let checked = this.checked;
        //let total = 0;
        let data = [];
  
        dt.data().each(function(info) {
          // ACA cambiamos el valor de la propiedad
          info.checked = checked;
          // ACA accedemos a las propiedades del objeto
         // if (info.checked) total += info.Precio;
          data.push(info);
        });
  
        dt.clear()
          .rows.add(data)
          .draw();
    });
  
    // Cuando hacen click en los checkbox del tbody SESSIONS
    $dt.on('change', 'tbody input', function() {
        let info = dt.row($(this).closest('tr')).data();
        // ACA accedemos a las propiedades del objeto
        info.checked = this.checked;
        //console.log(info.checked);
        if (this.checked){
            document.getElementById("remove_session").disabled = false;
            document.getElementById("download_sessions_config").disabled = false; 
            document.getElementById("download_session_data").disabled = false; 
            document.getElementById("view_session").disabled = false;
            
            
            var r_max = 0;
            var l_max = 0;
            var l_min = 0;
            var r_min = 0;
            var mean_load = 0;
            
            let dt = $('#sessionsList').DataTable();
			let vars = dt.data().toArray();
			let checkeds = dt.data().toArray().filter((data) => data.checked);
			console.log(checkeds[0].NumberSession);
			n_session = checkeds[0].NumberSession;
			
            
            

        }else{
            document.getElementById("remove_session").disabled = true;
            document.getElementById("download_sessions_config").disabled = true; 
            document.getElementById("download_session_data").disabled = true; 
            document.getElementById("view_session").disabled = true;
            
            
        }       
        
        
    });

    // Listener al click en detalles de cada paciente en SESSIONS
    dt.on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr');
      var row = dt.row( tr );

      if (row.child.isShown() ) {
          // This row is already open - close it
          row.child.hide();
          tr.find('svg').attr('data-icon', 'plus');    // FontAwesome 5
      }
      else {
          // Open this row
          row.child( format(row.data()) ).show();
        tr.find('svg').attr('data-icon', 'minus'); // FontAwesome 5
      }
    });

    //Formato de DETALLES de cada paciente.
    function format ( d ) {
      // `d` is the original data object for the row
      return '<table>'+
      '<thead>'+
        '<tr>'+
          '<th>Weight:</th>'+
          '<th>Age:</th>'+
          '<th>Leg Length:</th>'+
          '<th>Hip Upper Strap:</th>'+
          '<th>Knee Lower Strap:</th>'+
          '<th>Steps:</th>'+
          '<th>ROM:</th>'+
          '<th>Cadence:</th>'+
          '<th>PBWS:</th>'+
          '<th>Control Mode:</th>'+
          '<th>Right Hip Config:</th>'+
          '<th>Right Knee Config:</th>'+
          '<th>Left Hip Config:</th>'+
          '<th>Left Knee Config:</th>'+
          '<th>Observations:</th>'+
          
        '</tr>'+
      '</thead>'+
      '<tbody>'+
        '<tr>'+
          '<td>'+d.patient_weight+'</td>'+
          '<td>'+d.patient_age+'</td>'+
          '<td>'+d.leg_length+'</td>'+
          '<td>'+d.hip_upper_strap+'</td>'+
          '<td>'+d.knee_lower_strap+'</td>'+
          '<td>'+d.steps+'</td>'+
          '<td>'+d.ROM+'</td>'+
          '<td>'+d.gait_velocity+'</td>'+
          '<td>'+d.PBWS+'</td>'+
          '<td>'+d.control_mode+'</td>'+
          '<td>'+d.right_hip_config+'</td>'+
          '<td>'+d.right_knee_config+'</td>'+
          '<td>'+d.left_hip_config+'</td>'+
          '<td>'+d.left_knee_config+'</td>'+
          '<td>'+d.observations+'</td>'+
        '</tr>'+
      '</tbody>'+
      '</table>';




     // return '<table cellpadding="" cellspacing="0" border="0" style="padding-left:50px;">'+
     //     '<tr>'+
     //         '<td>Peso:</td>'+
     //         '<td>'+d.PesoPac+'</td>'+
     //     '</tr>'+
     //     '<tr>'+
     //         '<td>Altura:</td>'+
     //         '<td>'+d.TallaPac+'</td>'+
     //     '</tr>'+
     //     '<tr>'+
      //        '<td>Extra info:</td>'+
     //         '<td>And any further details here (images etc)...</td>'+
     //     '</tr>'+
     // '</table>';
  }
    
  


  
})


socket.on('patientdata',function(datapatient){

  //for (var i = 0; i < datapatient.length; i++) {
  //    listapacientes.push(datapatient[i]);
 // }
  //console.log(listapacientes);
  console.log(datapatient);


  let $pd = $('#patientsList');
  let pd = $pd.DataTable({
      "data": datapatient,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistapacientes, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistapacientes.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'NombrePaciente' },
          { data: 'ApellidoPaciente'},
          ],

          
  });


        // Cuando hacen click en los checkbox del tbody
        $pd.on('change', 'tbody input', function() {
          let info = pd.row($(this).closest('tr')).data();
          // ACA accedemos a las propiedades del objeto
          info.checked = this.checked;
          if (this.checked){
              document.getElementById("edit_patient").disabled = false;
              document.getElementById("remove_patient").disabled = false;
              document.getElementById("download_list_patient").disabled = false;
          }else{
              document.getElementById("edit_patient").disabled = true;
              document.getElementById("remove_patient").disabled = true;
              document.getElementById("download_list_patient").disabled = true;

              //location.reload();
              //document.getElementById("home-tab").setAttribute("focus",true);
              
            
              //pd.clear().draw();
             // pd.rows.add(datapatient).draw();
          }
         
      });


    //ADD PATIENT
    $('#b_add_p').on('click', function() {
      let patfname = document.getElementById("FNPatient").value;
      let patlname = document.getElementById("LNPatient").value;
      console.log(patfname);
      socket.emit('insertPatient',[patfname, patlname]);
      //location.reload(true);
      $('#patientsList').DataTable().row.add({
          'NombrePaciente': patfname,
          'ApellidoPaciente': patlname,
      }).draw();
      //setTimeout(socket.emit('refreshlist'), 3000); 
      //datatable.data(datas).draw();
    });

        //  suscribimos un listener al click del boton remove
    $('#b_delete_p').on('click', function() {
        let dt = $('#patientsList').DataTable();
        let vars = dt.data().toArray();
        let checkeds = dt.data().toArray().filter((data) => data.checked);

        for (i = 0; i < vars.length; i++) {
            if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
              console.log(i);
              var indexrow = i;
            };
        };
        dt.row(indexrow).remove().draw();
        socket.emit('deleted_patient',checkeds[0].idtabla_pacientes);
    });

    $('#b_download_p').on('click', function() {
      socket.emit('download_patients');
      window.open('http://192.168.43.1:3000/downloadpatients');
    });


    $('#edit_patient').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      document.getElementById("editFNPatient").value = checkeds[0].NombrePaciente ;
      document.getElementById("editLNPatient").value =  checkeds[0].ApellidoPaciente;
    })

    $('#b_edit_p').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      
      checkeds[0].NombrePaciente = document.getElementById("editFNPatient").value;
      checkeds[0].ApellidoPaciente = document.getElementById("editLNPatient").value;

      dt.row(indexrow).remove().draw();
      $('#patientsList').DataTable().row.add({
        'NombrePaciente': checkeds[0].NombrePaciente,
        'ApellidoPaciente': checkeds[0].ApellidoPaciente,
      }).draw();
      
      socket.emit('edit_patient',checkeds[0]);
    });


})



socket.on('therapistdata',function(datatherapist){
  console.log(datatherapist);


  let $td = $('#therapistList');
  let td = $td.DataTable({
      "data": datatherapist,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistater, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistater.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'NombreTerapeuta' },
          { data: 'ApellidoTerapeuta'},
          { data: 'Centro'},
          ],

          
  });




  // Cuando hacen click en los checkbox del tbody
  $td.on('change', 'tbody input', function() {
  let info = td.row($(this).closest('tr')).data();
  // ACA accedemos a las propiedades del objeto
  info.checked = this.checked;
      if (this.checked){
          document.getElementById("edit_therapist").disabled = false;
          document.getElementById("remove_therapist").disabled = false;
          //document.getElementById("download_list_therapist").disabled = false;
      }else{
          document.getElementById("edit_therapist").disabled = true;
          document.getElementById("remove_therapist").disabled = true;

      }
  
  });
  
  //ADD THERAPIST
  $('#b_add_t').on('click', function() {
      let therfname = document.getElementById("FNTherapist").value;
      let therlname = document.getElementById("LNTherapist").value;
      let center = document.getElementById("Center").value;
      console.log(therfname);
      socket.emit('insertTherapist',[therfname, therlname, center]);
      $('#therapistList').DataTable().row.add({
          'NombreTerapeuta': therfname,
          'ApellidoTerapeuta': therlname,
          'Centro': center,
      }).draw();
  });
  
  //  DELET THERAPIST
  $('#b_delete_t').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
        };
    };
    dt.row(indexrow).remove().draw();
    socket.emit('deleted_therapist',checkeds[0].idtabla_terapeutas);
  });

  $('#edit_therapist').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
          console.log(checkeds[0].idtabla_terapeutas);
        };
    };
    document.getElementById("editFNTherapist").value = checkeds[0].NombreTerapeuta ;
    document.getElementById("editLNTherapist").value =  checkeds[0].ApellidoTerapeuta;
    document.getElementById("editCenter").value =  checkeds[0].Centro;
  })

  $('#b_edit_t').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
          console.log(checkeds[0].idtabla_terapeutas);
        };
    };
    
    checkeds[0].NombreTerapeuta = document.getElementById("editFNTherapist").value;
    checkeds[0].ApellidoTerapeuta = document.getElementById("editLNTherapist").value;
    checkeds[0].Centro = document.getElementById("editCenter").value;

    dt.row(indexrow).remove().draw();
    $('#therapistList').DataTable().row.add({
      'NombreTerapeuta': checkeds[0].NombreTerapeuta,
      'ApellidoTerapeuta': checkeds[0].ApellidoTerapeuta,
      'Centro': checkeds[0].Centro
    }).draw();
    
    socket.emit('edit_therapist',checkeds[0]);
  });


  $('#b_download_t').on('click', function() {
    socket.emit('download_therapist');
    window.open('http://192.168.43.1:3000/downloadtherapists');
  });

  //  DELET SESSION
  $('#b_delete_s').on('click', function() {
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);
    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtable_session == vars[i].idtable_session){
          console.log(i);
          var indexrow = i;
        };
    };
    console.log()
    dt.row(indexrow).remove().draw();
    socket.emit('deleted_session',checkeds[0].idtable_session);
  });

  // DOWNLOAD DATA SESSION
  $('#b_download_s_data').on('click', function() {
    console.log("Download Data")
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].NumberSession == vars[i].NumberSession){
          console.log(i);
          console.log(checkeds[0].NumberSession);
          socket.emit('download_sessions_data', (checkeds[0].NumberSession));
        };
    };
    
  })

  socket.on('open_download_sessions_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadsessionsdata');
  });

  $('#b_download_s_conf').on('click', function() {
    socket.emit('download_sessions_config');
    window.open('http://192.168.43.1:3000/downloadsessionsconfig');
  });

  

})


$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
  });
