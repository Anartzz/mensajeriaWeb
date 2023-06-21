const usuarios = document.querySelector("#usuarios")
const nombreUsuario = document.querySelector("#nombreUsuario")
let lenghtAnterior = 0
nombreUsuario.addEventListener("input", () => {
    if (nombreUsuario.value.lenght == 1 && lenghtAnterior == 0) {
        fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/agregar`, {
            method: "post",
            headers: {
                'Content-Type': 'text/plain'
            },
            body: nombreUsuario.value
        })
    }
    lenghtAnterior = nombreUsuario.value.lenght
    
})
// hacer request dapara le primera letra luego filtrar con js