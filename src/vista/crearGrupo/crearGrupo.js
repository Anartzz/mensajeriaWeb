const selectUsuarios = document.querySelector("#selectUsuarios");
const usuariosElegidos = document.querySelector("#usuariosElegidos");
const imgGrupo = document.querySelector("#fotoGrupo");
const inputUsuario = document.querySelector("#usuario");
const btCrearGrupo = document.querySelector("#crearGrupo");
let usuariosAgregados;
const direcion = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const sesion = JSON.parse(localStorage.getItem("sesion"));
let fotoPredeterminada = "../imagenes/fotoPerfilPredeterminado.jpg";
let usuariosDisposibles = new Map();
imgGrupo.src = fotoPredeterminada;
fetch(direcion + "/getUsuariosAgregados", {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: localStorage.getItem("sesion"),
})
    .then((res) => res.json())
    .then((res) => {
        usuariosAgregados = res;
        if (res[0] == true) {
            localStorage.removeItem("sesion");
            window.location.href = direcion + "/login";
        }
        for (let i = 0; i < res.length; i++) {
            pintarUsuariosAgregados(res, i);
        }
        addAgregadosClick();
    });

inputUsuario.addEventListener("input", () => {
    usuariosDisposibles.clear();
    selectUsuarios.innerHTML = "";
    for (let i = 0; i < usuariosAgregados.length; i++) {
        let elegido = false;
        for (let elegidos of usuariosElegidos.children) {
            if (elegidos.textContent == usuariosAgregados[i].nombre) {
                elegido = true;
                break;
            }
        }
        if (
            !elegido &&
            usuariosAgregados[i].nombre
                .toLowerCase()
                .match(inputUsuario.value.toLowerCase())
        ) {
            pintarUsuariosAgregados(usuariosAgregados, i);
        }
    }
    addAgregadosClick();
});

function pintarUsuariosAgregados(usuariosAgregados, i) {
    usuariosDisposibles.set(i, usuariosAgregados[i]);
    selectUsuarios.innerHTML += `<div id="${i}"><img src="${
        usuariosAgregados[i].foto
            ? usuariosAgregados[i].foto
            : fotoPredeterminada
    }"/>${usuariosAgregados[i].nombre}</div>`;
}

function addAgregadosClick() {
    for (let usuario of selectUsuarios.children) {
        usuario.addEventListener("click", function () {
            usuariosElegidos.innerHTML += `<div class="usuarios">${this.innerHTML}</div>`;
            usuariosDisposibles.delete(parseInt(this.id));
            selectUsuarios.removeChild(this);
        });
    }
}

btCrearGrupo.addEventListener("click", () => {
    let nombres = Array(usuariosElegidos.children.length);
    let i = 0;
    for (let usuarios of usuariosElegidos.children) {
        // comprobar que no se mete el mismo dos veces
        nombres[i++] = usuarios.textContent;
    }
    fetch(direcion + "/crearGrupo", {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            sesion: sesion,
            /*nombre: ,
            descripcion:,
            foto: ,*/
            participantes: nombres,
        }),
    });
});
