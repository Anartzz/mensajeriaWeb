const selectNombres = document.querySelector("#usuarios");
const nombreUsuario = document.querySelector("#nombreUsuario");
const usuariosElegido = document.querySelector("#usuariosElegidos");
const agregar = document.querySelector("#agregar");
let lenghtAnterior = 0;
let usuarios = [];
let usuariosFiltrados = [];
let direcion = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
let sesion = JSON.parse(localStorage.getItem("sesion"));
if (!sesion) {
    redirigir("/login");
}
nombreUsuario.addEventListener("input", async () => {
    if (nombreUsuario.value.length == 1 && lenghtAnterior == 0) {
        usuarios = await (
            await fetch(`${direcion}/getUsuariosNoAgregados`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombreUsuario: nombreUsuario.value,
                    sesion: sesion,
                }),
            })
        ).json();
        if (usuarios[0] == true) {
            redirigir("/login");
        }
        eleminarElegido(usuarios);
        usuariosFiltrados = usuarios;
    }
    if (usuarios) {
        let usuariosFiltrados2 = [];
        selectNombres.innerHTML = "";
        if (lenghtAnterior > nombreUsuario.value.length) {
            usuariosFiltrados = usuarios;
        }
        lenghtAnterior = nombreUsuario.value.length;
        for (let usuario of usuariosFiltrados) {
            if (
                nombreUsuario.value != "" &&
                usuario.nombre
                    .toLowerCase()
                    .match(nombreUsuario.value.toLowerCase())
            ) {
                selectNombres.innerHTML += `<option value=${usuario.nombre}>${usuario.nombre}</option>`;
                usuariosFiltrados2.push(usuario);
            }
        }
        usuariosFiltrados = usuariosFiltrados2;
    } else {
        alert("error al filtrar usuarios");
    }
});

selectNombres.addEventListener("click", () => {
    if (selectNombres.value) {
        usuariosElegido.innerHTML += `<div class="usuarioElegido">${selectNombres.value}</div>`;
        selectNombres.options[selectNombres.selectedIndex].remove();
        eleminarElegido(usuarios);
        eleminarElegido(usuariosFiltrados);
    }
});

function eleminarElegido(usuarios) {
    if (usuariosElegido.children.length != 0) {
        for (let i = 0; i < usuarios.length; i++) {
            for (let element of usuariosElegido.children) {
                if (element.textContent === usuarios[i].nombre) {
                    usuarios.splice(i, 1);
                }
            }
        }
    }
}
agregar.addEventListener("click", async () => {
    let usuarios = [];
    for (let usuario of usuariosElegido.children) {
        usuarios.push({ nombre: usuario.textContent });
    }

    let result = await (
        await fetch(`${direcion}/agregar`, {
            method: "post",
            headers: {
                "Content-Type": "text/plain",
            },

            body: JSON.stringify({
                usuarios: usuarios,
                sesion: sesion,
            }),
        })
    ).json();
    if (result[0] == true) {
        redirigir("/login");
    } else {
        if (result) {
            alert("usuarios agregados");
        } else {
            alert("error al agregar los usuarios");
        }
        redirigir("/");
    }
});

function redirigir(url) {
    window.location.href = direcion + url;
}
