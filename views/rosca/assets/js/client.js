
function consultaPorNumeroEmpleado() {
    $('#premiadosContent').addClass('hidden');
    var noEmpleado = $('#search').val();

    $.ajax({
        // url: "http://localhost:3000/empleado/" + noEmpleado
        url: "http://localhost:3000/empleado/" + noEmpleado
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
            var nombre = data.empleado.nombre + ' ' + data.empleado.apellidos;
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
        url: "http://localhost:3000/premiados"
    }).then(function (data) {
        if (!data.message) {

            var dataSet = [];
            $.each(data.premiados, function (index, item) {
                var itemValues = [];
                itemValues.push(item.noEmpleado);
                itemValues.push(item.nombre);
                itemValues.push(item.apellidos);
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
                    { "className": "dt-center", "targets": "_all" }
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
        url: "http://localhost:3000/galeria/" + region
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
            url: "http://localhost:3000/empleado/region/" + regionId
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
        url: "http://localhost:3000/seleccionados"
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
        url: "http://localhost:3000/premiosdisponilbles"
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
    var url = "http://localhost:3000/empleado/" + idEmpleado + "/premio/" + idPremio;
    $.ajax({
        url: url,
        method: 'POST'
    }).then(function (data) {
        if (data.premio) {
            alert('Premio asignado correctamente.');
            $('#formAsignarPremio').trigger("reset");dis
        }
    });
}

function uploadFile() {
    var region = $('#filtroRegionesAdmin option:selected').val();
    var empleado = $('#filtroEmpleadosAdmin option:selected').val();
    $.ajax({
        url: "http://localhost:3000/upload",
        method: 'POST',
        data: { region, empleado }
    }).then(function (data) {
        if (data.premio) {
            alert('Premio asignado correctamente.');
        }
    });
}

function cambioEstatus() {
    var filtroEmpleados = $('#filtroEmpleadosAdmin option:selected').val();
    var empleadoSeleccionado;
    if ($('#empleadoEncargado').length) {
        empleadoSeleccionado = $('#empleadoEncargado').val();
    }else {
        empleadoSeleccionado = $('#empleadoSeleccionado').val();
    }
    var filtroRegiones = $('#filtroRegionesAdmin option:selected').val();
    var url = $("#formEstatus").attr('action');
    $.ajax({
        url: "http://localhost:3000" + url,
        method: 'POST',
        data: { filtroEmpleados, empleadoSeleccionado, filtroRegiones }
    }).then(function (data) {
        if (data.message) {
            alert(data.message);
        }
        if (data.empleado) {
            alert('Cambio exitoso. La tabla no se autorecarga, asi que refresca la pagina');
            $("#empleadosAdmin").load(location.href + " #empleadosAdmin>*", "");
            $('#formEstatus').trigger("reset");
        }
    });
}

function cargarNumeroEmpleado() {
    var id = $('#filtroEmpleadosAdmin option:selected').val();
    $.ajax({
        url: "http://localhost:3000/empleado/datos/" + id
    }).then(function (data) {
        if (data.empleado) {
            $("#ganadores").val(data.empleado.noEmpleado);
        }
    });
}

function cargarLimitesSeleccionados() {
    var keyName = 'Seleccionados';
    $.ajax({
        url: "http://localhost:3000/limites/key/" + keyName
    }).then(function (data) {
        if (data.limite) {
            $("#cantidad_seleccionados").val(data.limite.value);
        }
    });
}

function modificarLimitesSeleccionados() {
    var nuevaCantidad = $('#cantidad_seleccionados').val();
    $.ajax({
        url: "http://localhost:3000/limites/modificar_seleccionados",
        method: 'POST',
        data: {cantidadLimite : nuevaCantidad}
    }).then(function (data) {
        if (data.nuevaCantidad) {
            $("#cantidad_seleccionados").val(data.nuevaCantidad);
            alert('Cantidad limite actualizada correectamente a ' + data.nuevaCantidad);
        }
    });
}




