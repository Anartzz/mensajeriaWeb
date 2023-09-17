const direcion = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const linkCrearCuenta = document.querySelector("#crearCuenta");
linkCrearCuenta.href = `${direcion}/crearUsuario`;

const botonEnviar = document.querySelector("#enviar");
const nombreUsuario = document.querySelector("#nombreUsuario");
const contrasenna = document.querySelector("#contrasenna");
botonEnviar.addEventListener("click", async () => {
    const usuarioSesion = await (
        await fetch(`${direcion}/login`, {
            method: "post",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                nombre: nombreUsuario.value,
                contrasenna: contrasenna.value,
            }),
        })
    ).text();

    if (usuarioSesion && usuarioSesion != "false") {
        console.log("hola");
        localStorage.setItem("sesion", usuarioSesion);
        window.location.href = direcion;
    } else {
        if (usuarioSesion == "") {
            alert("nombre o contrasenna incorrecta");
        } else {
            alert("error al iniciar");
        }
    }
});
