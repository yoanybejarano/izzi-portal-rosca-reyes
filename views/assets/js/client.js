
function consultaPorNumeroEmpleado() {
    $('#empleadosContent').addClass('hidden');
    let noEmpleado = $('#search').val();

    $.ajax({
        url: "http://localhost:3000/empleado/" + noEmpleado
    }).then(function (data) {

        if (data.message) {
            $('#resultMessageError').removeClass('hidden');
            $('#resultSeachMessage').addClass('hidden');
        } else {
            $('#resultMessageError').addClass('hidden');
            $('#resultSeachMessage').removeClass('hidden');
            let message;
            let nombre = data.empleado.nombre + ' ' + data.empleado.apellidos;
            if (data.empleado.premio && data.empleado.premio.length > 0) {
                message = nombre + ' ganaste: ' + data.empleado.premio;
            } else {
                message = nombre + ' no estas entre los premiados.';
            }
            $('#resultSeachMessage').text(message);
        }
    });
}

function obtenerEmpleados() {

    $('#resultMessageError').addClass('hidden');
    $('#resultSeachMessage').addClass('hidden');
    $('#empleados').DataTable().destroy();

    $.ajax({
        url: "http://localhost:3000/empleado"
    }).then(function (data) {
        var tbody = document.createElement("tbody");
        if (!data.message) {

            var dataSet = [];
            $.each(data.empleados, function (index, item) {
                var itemValues = [];
                itemValues.push(item.noEmpleado);
                itemValues.push(item.nombre);
                itemValues.push(item.apellidos);
                itemValues.push(item.area);
                itemValues.push(item.region.nombre);
                dataSet.push(itemValues);
            });

            $('#empleados').DataTable({
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
    $('#empleadosContent').removeClass('hidden');
}