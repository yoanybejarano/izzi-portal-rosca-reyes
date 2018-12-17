
function consultaPorNumeroEmpleado() {
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