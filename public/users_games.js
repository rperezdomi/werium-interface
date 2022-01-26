//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

var n_session;


socket.emit('games:refreshlist');

socket.on('games:datos_usuarios',function(datapatient){
	console.log('co');
	console.log('co');
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
          { data: 'nombre_usuario' },
          { data: 'apellido_usuario'},
          { data: "edad"},
          { data: "sexo"}
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
    $('#b_add_user').on('click', function() {
      let patfname = document.getElementById("FNPatient").value;
      let patlname = document.getElementById("LNPatient").value;
      let user_age = document.getElementById("user_age").value;
      let user_gender = document.getElementById("user_gender").value;
      socket.emit('games:add_user',[patfname, patlname, user_age, user_gender]);
      //location.reload(true);
      $('#patientsList').DataTable().row.add({
          'nombre_usuario': patfname,
          'apellido_usuario': patlname,
          'edad': user_age,
          'sexo': user_gender
      }).draw();
    });

        //  suscribimos un listener al click del boton remove
    $('#b_delete_p').on('click', function() {
        let dt = $('#patientsList').DataTable();
        let vars = dt.data().toArray();
        let checkeds = dt.data().toArray().filter((data) => data.checked);

        for (i = 0; i < vars.length; i++) {
            if (checkeds[0].id_usuario== vars[i].id_usuario){
              console.log(i);
              var indexrow = i;
            };
        };
        dt.row(indexrow).remove().draw();
        socket.emit('games:delete_user',checkeds[0].id_usuario);
    });

    $('#b_download_p').on('click', function() {
      socket.emit('games:download_users_list');
      window.open('http://192.168.43.1:3000/downloadpatients');
    });


    $('#edit_patient').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);
		console.log(checkeds);
      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].id_usuario == vars[i].id_usuario){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].id_usuario);
          };
      };
      document.getElementById("editFNPatient").value = checkeds[0].nombre_usuario ;
      document.getElementById("editLNPatient").value =  checkeds[0].apellido_usuario;
      document.getElementById("edit_user_age").value = checkeds[0].edad;
      document.getElementById("edit_user_gender").value =  checkeds[0].sexo;
    })

    $('#b_edit_p').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].id_usuario == vars[i].id_usuario){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].id_usuario);
          };
      };
      
      checkeds[0].nombre_usuario = document.getElementById("editFNPatient").value;
      checkeds[0].apellido_usuario = document.getElementById("editLNPatient").value;
      checkeds[0].edad = document.getElementById("edit_user_age").value;
      checkeds[0].sexo = document.getElementById("edit_user_gender").value;

      dt.row(indexrow).remove().draw();
      $('#patientsList').DataTable().row.add({
        'nombre_usuario': checkeds[0].nombre_usuario,
        'apellido_usuario': checkeds[0].apellido_usuario,
        'edad': checkeds[0].edad,
        'sexo': checkeds[0].sexo,
      }).draw();
      
      socket.emit('games:edit_user',checkeds[0]);
    });


})

socket.on('games:datos_configuraciones', function(datas) {
    
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
            { data: 'nombre_usuario' },
            { data: 'apellido_usuario'},
            { data: 'numero_sesion'},
            { data: 'juego'},
            { data: 'numero_objetivos'}
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
            document.getElementById("download_session_data").disabled = false;         

        }else{
            document.getElementById("remove_session").disabled = true;
            document.getElementById("download_session_data").disabled = true; 
            
            
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
  
		//  DELET SESSION
  $('#b_delete_s').on('click', function() {
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);
    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].id_sesion == vars[i].id_sesion){
          console.log(i);
          var indexrow = i;
        };
    };
    dt.row(indexrow).remove().draw();
    socket.emit('games:delet_session',checkeds[0].id_sesion);
  });

  // DOWNLOAD DATA SESSION
  $('#b_download_s_data').on('click', function() {
    let dt = $('#sessionsList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

	for (i = 0; i < vars.length; i++) {
        if (checkeds[0].id_sesion == vars[i].id_sesion){
          console.log(i);
          socket.emit('games:download_angles_data', (checkeds[0].id_sesion));

          var indexrow = i;
        };
    };
    
    
  })

  socket.on('open_download_sessions_link',function(idsesion){
    window.open('http://192.168.43.1:3000/downloadsessionsdata');
  });

  $('#b_download_s_conf').on('click', function() {
    socket.emit('games:download_sessions_config');
    window.open('http://192.168.43.1:3000/downloadsessionsconfig');
  });
  
   $('#b_download_s_obj').on('click', function() {
    socket.emit('games:download_sessions_objectives');
    window.open('http://192.168.43.1:3000/downloadsessionsobjectives');
  });

  
})


$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
  });
