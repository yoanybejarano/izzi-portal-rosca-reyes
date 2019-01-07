function consultaPorNumeroEmpleado() {
    $('#premiadosContent').addClass('hidden');
    var noEmpleado = $('#search').val();

    $.ajax({
        // url: "/roscadereyes/empleado/" + noEmpleado
        url: "/roscadereyes/empleado/" + noEmpleado
    }).then(function (data) {

        if (data.message) {
            $('#resultMessageError').removeClass('hidden').text(data.message);
            $('#resultSeachMessage').addClass('hidden');
        } else {
            $('#resultMessageError').addClass('hidden');
            $('#resultSeachMessage').removeClass('hidden');
            var message;
            // var nombre = data.empleado.nombre + ' ' + data.empleado.apellidos;
            // if (data.empleado.premio && data.empleado.premio.length > 0) {
            //     message = nombre + ' ganaste: ' + data.empleado.premio;
            // } else {
            //     message = nombre + ' no estas entre los premiados.';
            // }
            var nombre = data.empleado.nombre;
            if (data.empleado.premio) {
                message = nombre + ' ganaste: ' + data.empleado.premio.nombre;
            } else {
                message = nombre + ' no estas entre los premiados.';
            }
            $('#resultSeachMessage').text(message);
        }
    });
}

function obtenerEmpleadosPremiados() {

    $('#resultMessageError').addClass('hidden');
    $('#resultSeachMessage').addClass('hidden');
    $('#premiados').DataTable().destroy();

    $.ajax({
        url: "/roscadereyes/premiados"
    }).then(function (data) {
        if (!data.message) {

            var dataSet = [];
            $.each(data.premiados, function (index, item) {
                var itemValues = [];
                itemValues.push(item.noEmpleado);
                itemValues.push(item.nombre);
                itemValues.push(item.area);
                itemValues.push(item.region.nombre);
                itemValues.push(item.premio.nombre);
                dataSet.push(itemValues);
            });

            $('#premiados').DataTable({
                "language": {
                    "lengthMenu": "Mostrar _MENU_ resultados por pagina",
                    "zeroRecords": "No se encontraron resultados",
                    "info": "Mostrando pagina _PAGE_ de _PAGES_",
                    "infoEmpty": "No hay resultados",
                    "infoFiltered": "(Filtrado de un total de _MAX_ filas)",
                    "search": "Busqueda:",
                    "paginate": {
                        "first": "Primera",
                        "last": "Ultima",
                        "next": "Proxima",
                        "previous": "Previa"
                    }
                }, "data": dataSet,
                "columnDefs": [
                    {"className": "dt-center", "targets": "_all"}
                ]
            });

        }
    });
    $('#premiadosContent').removeClass('hidden');
}

function esFotoPerfil() {
    if ($("#checkPerfil").is(":checked")) {
        $('#empleadoSelect').removeClass('hidden');
    } else {
        $('#empleadoSelect').addClass('hidden');
    }
}

function cargarImagenes() {
    var region = $('#ganadores_localidad').val();

    $.ajax({
        url: "/roscadereyes/galeria/" + region
    }).then(function (data) {
        var fotosEventos = $('#fotosEventos');
        var fotosPerfiles = $('#fotosPerfiles');
        fotosEventos.empty();
        fotosPerfiles.empty();
        $.each(data.archivos, (index, item) => {
            console.log(item.datosArchivo.archivo);
            var row = "<tr><td>" + item.datosArchivo.archivo + "</td><td>" + item.archivoDir + "</td></tr>";
            if (item.datosArchivo.empleado) {
                fotosPerfiles.append(row);
            } else {
                fotosEventos.append(row);
            }
        });
    });
}

function cargarEmpleadosPorRegion() {
    $("#seleccion").addClass('hidden');
    if ($("#filtroRegionesAdmin option:selected").index() === 0) {
        $("#filtroEmpleadosAdmin").prop('selectedIndex', 0);
        seleccionarEmpleado();
    } else {
        var regionId = $('#filtroRegionesAdmin').children("option:selected").val();
        $.ajax({
            url: "/roscadereyes/empleado/region/" + regionId
        }).then(function (data) {

            var empleadosDropDown = $("#filtroEmpleadosAdmin");
            empleadosDropDown.empty();
            empleadosDropDown.append($("<option />").text('Seleccione'));
            $.each(data.empleados, function (index, item) {
                if (item.seleccionado === false && item.rol.nombre !== 'Encargado') {
                    var option = $("<option />").val(this._id).text(item.nombre + ' ' + item.apellidos).attr('seleccionado', item.seleccionado);
                    empleadosDropDown.append(option);
                }
            });
        });
    }
}

function seleccionarEmpleado() {
    if ($("#filtroEmpleadosAdmin option:selected").index() > 0) {
        var seleccionado = $("#filtroEmpleadosAdmin option:selected").attr("seleccionado");
        if ($('#checkboxEncargado').length) {
            if (seleccionado === "true") {
                $('#empleadoEncargado').attr('checked', 'checked');
            } else {
                $('#empleadoEncargado').removeAttr('checked');
            }
        } else if ($('#checkboxSeleccionado').length) {
            if (seleccionado === true) {
                $('#empleadoSeleccionado').attr('checked', 'checked');
            } else {
                $('#empleadoSeleccionado').removeAttr('checked');
            }
        }
        $("#seleccion").removeClass('hidden');
    } else {
        $("#seleccion").addClass('hidden');
    }
}

function cargarEmpleadosSeleccionados() {
    $.ajax({
        url: "/roscadereyes/seleccionados"
    }).then(function (data) {
        var empleadosDropDown = $("#empleadosSeleccionados");
        empleadosDropDown.empty();
        empleadosDropDown.append($("<option />").text('Seleccione').val('nullValue'));
        $.each(data.seleccionados, function (index, item) {
            var option = $("<option />").val(this._id).text(item.nombre + ' ' + item.apellidos);
            empleadosDropDown.append(option);
        });
    });
}

function cargarPremiosSinAsignar() {
    $.ajax({
        url: "/roscadereyes/premiosdisponilbles"
    }).then(function (data) {
        var premiosDropDown = $("#premios");
        premiosDropDown.empty();
        premiosDropDown.append($("<option />").text('Seleccione').val('nullValue'));
        $.each(data.disponibles, function (index, item) {
            var option = $("<option />").val(this._id).text(item.nombre + ' (' + item.disponibles + ')');
            premiosDropDown.append(option);
        });
    });
}

function asignarPremio() {
    var idEmpleado = $('#empleadosSeleccionados option:selected').val();
    var idPremio = $('#premios option:selected').val();
    var url = "/roscadereyes/empleado/" + idEmpleado + "/premio/" + idPremio;
    $.ajax({
        url: url,
        method: 'POST'
    }).then(function (data) {
        if (data.premio) {
            alert('Premio asignado correctamente.');
            $('#formAsignarPremio').trigger("reset");
            dis
        }
    });
}

function uploadFileEvento() {
    var region = $('#filtroRegionFotoEvento option:selected').val();
    var photoEvento = $('#photoEvento').prop('files')[0];
    var formData = new FormData();
    formData.append('filtroRegionFotoEvento', region);
    formData.append('photo', photoEvento);
    $.ajax({
        url: "/roscadereyes/upload/",
        method: 'POST',
        data: formData,
        contentType: false,
        processData: false
    }).then(function (data) {
        if (data.message) {
            alert(data.message);
        }
    });
}

function uploadFotoPerfil() {
    $('form_ganadores').on('submit', function (e) {
        e.preventDefault();
    });
    var filtroEmpleadosFoto = $('#ganadores_nombre').val();
    var filtroRegionFoto = $('#filtroRegionFoto option:selected').val();
    var noEmpleado = $('#ganadores').val()
    var photo = $('#photoPerfil').prop('files')[0];
    var formData = new FormData();
    formData.append('filtroEmpleadosFoto', filtroEmpleadosFoto);
    formData.append('filtroRegionFoto', filtroRegionFoto);
    formData.append('noEmpleado', noEmpleado);
    formData.append('photo', photo);
    $.ajax({
        url: "/roscadereyes/empleado/create/",
        method: 'POST',
        data: formData,
        contentType: false,
        processData: false
    }).then(function (data) {
        if (data.message) {
            alert(data.message);
        }
    });
}

function cambioEstatus() {
    var filtroEmpleados = $('#filtroEmpleadosAdmin option:selected').val();
    var empleadoSeleccionado;
    if ($('#empleadoEncargado').length) {
        empleadoSeleccionado = $('#empleadoEncargado').val();
    } else {
        empleadoSeleccionado = $('#empleadoSeleccionado').val();
    }
    var filtroRegiones = $('#filtroRegionesAdmin option:selected').val();
    var url = $("#formEstatus").attr('action');
    $.ajax({
        url: "" + url,
        method: 'POST',
        data: {filtroEmpleados, empleadoSeleccionado, filtroRegiones}
    }).then(function (data) {
        if (data.message) {
            alert(data.message);
        }
        if (data.empleado) {
            alert('Cambio exitoso.');
            $("#empleadosAdmin").load(location.href + " #empleadosAdmin>*", "");
            $('#formEstatus').trigger("reset");
        }
    });
}

function cargarNumeroEmpleado() {
    var id = $('#filtroEmpleadosAdmin option:selected').val();
    $.ajax({
        url: "/roscadereyes/empleado/datos/" + id
    }).then(function (data) {
        if (data.empleado) {
            $("#ganadores").val(data.empleado.noEmpleado);
        }
    });
}

function cargarLimitesSeleccionados() {
    var keyName = 'Seleccionados';
    $.ajax({
        url: "/roscadereyes/limites/key/" + keyName
    }).then(function (data) {
        if (data.limite) {
            $("#cantidad_seleccionados").val(data.limite.value);
        }
    });
}

function modificarLimitesSeleccionados() {
    var nuevaCantidad = $('#cantidad_seleccionados').val();
    $.ajax({
        url: "/roscadereyes/limites/modificar_seleccionados",
        method: 'POST',
        data: {cantidadLimite: nuevaCantidad}
    }).then(function (data) {
        if (data.nuevaCantidad) {
            $("#cantidad_seleccionados").val(data.nuevaCantidad);
            alert('Cantidad limite actualizada correctamente a ' + data.nuevaCantidad);
        }
    });
}

function cargarFormularios() {
    if ($('#perfil').is(":checked")) {
        $("#sectionFormGanadores").removeClass("hidden");
        $("#sectionFormGanadoresEvento").addClass("hidden");
    } else {
        $("#sectionFormGanadores").addClass("hidden");
        $("#sectionFormGanadoresEvento").removeClass("hidden");
    }
}

function listEmpleadosParaFotos() {
    $("#ganadores").prop('selectedIndex', 0);
    var regionId = $('#filtroRegionFoto option:selected').val();
    $.ajax({
        url: "/roscadereyes/empleado/region/" + regionId
    }).then(function (data) {

        var empleadosDropDown = $("#ganadores");
        empleadosDropDown.empty();
        empleadosDropDown.append($("<option />").text('Seleccione'));
        $.each(data.empleados, function (index, item) {
            // if (item.seleccionado === false && item.rol.nombre !== 'Encargado') {
            //     var option = $("<option />").val(item.nombre + ' ' + item.apellidos).text(this.noEmpleado).attr('antiguedad', item.antiguedad).attr('localidad', item.antiguedad);
            //     empleadosDropDown.append(option);
            // }
            var option = $("<option />").val(item.nombre).text(this.noEmpleado);
            option.attr('antiguedad', item.antiguedad);
            option.attr('localidad', item.antiguedad);
            empleadosDropDown.append(option);
        });
    });
}

function fillDatos() {
    var noEmpleado = $('#ganadores').val();
    var regionId = $('#filtroRegionFoto option:selected').val();
    $.ajax({
        url: "/roscadereyes/empleado/" + noEmpleado + "/region/" + regionId
    }).then(function (data) {
        if(data.empleado){
            $('#ganadores_nombre').val(data.empleado.nombre);
            $('#localidad').val(data.empleado.localidad);
            if (data.empleado.antiguedad) {
                var format = moment(data.empleado.antiguedad)._f;
                moment.locale('es');
                var antiguedad = moment(data.empleado.antiguedad, format).fromNow();
                $('#antiguedad').val(antiguedad);
                // $('#antiguedad').val(data.empleado.antiguedad);
            }else{
                $('#antiguedad').val('Desconocida');
            }
            $('#submitEmpleado').removeAttr('disabled');
        }else {
            alert(data.message);
        }
    });
}

function loadIds() {
    var regionId = $('#filtroRegionFoto option:selected').val();
    $.ajax({
        url: "/roscadereyes/empleadoids/" + regionId
    }).then(function (data) {
        autocomplete(document.getElementById("ganadores"), data.identificadores.map(e => e.noEmpleado));
    });
}





