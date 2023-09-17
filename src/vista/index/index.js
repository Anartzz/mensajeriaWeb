const chatsSection = document.querySelector("#chats");
const mensajes = document.querySelector("#mensajes");
const chatHead = document.querySelector("#chatHead");
const inputTexto = document.querySelector("#input");
const nuevoMensaje = document.querySelector("#nuevoMensaje");
const botonEnviar = document.querySelector("#enviar");
const nombreUsuario = document.querySelector("#nombreUsuario");
const fotoPerfil = document.querySelector("#fotoPerfil");
const linkCerrarSesion = document.querySelector("#cerrarSesion");
let chatResumenes = new Map();
let chats;
let numeroDeMensaje = 0;
let chatElegido = {};
chatElegido.id = 0;
let direcion = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
let sesion = JSON.parse(localStorage.getItem("sesion"));
if (!sesion) {
    redirigir("/login");
}
nombreUsuario.textContent = sesion.nombre;
let fotoPredeterminada = "../imagenes/fotoPerfilPredeterminado.jpg";
fotoPerfil.src = sesion.foto ? sesion.foto : fotoPredeterminada;
document.querySelector("#agregarUsuario").href = direcion + "/agregar";
document.querySelector("#cuenta").href = direcion + "/cuenta";
document.querySelector("#crearGrupo").href = direcion + "/crearGrupo";
linkCerrarSesion.href = direcion + "/login";
linkCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("sesion");
});
const socket = new WebSocket(
    `ws://${window.location.hostname}:${window.location.port}`
);

socket.onmessage = ({ data }) => {
    data = JSON.parse(data);
    switch (data.accion) {
        case "error sesion":
            redirigir("/login");
            break;
        case "recibirMensaje":
            let chatResumen;
            let mensaje = data.mensaje;
            if (chatElegido.id == mensaje.chat_id) {
                ponerMensajeEnPantalla(mensaje);
                setLeido(chatElegido.id);
            } else {
                chatResumen = chatResumenes.get(mensaje.chat_id);
                chatResumen.setAttribute("style", "background-color: purple");
            }
            ponerUltimoMensaje(mensaje);
            if (chatsSection.children[0] != chatResumen) {
                if (!chatResumen) {
                    chatResumen = chatElegido;
                }
                chatsSection.insertAdjacentElement("afterbegin", chatResumen);
            }
            break;
        case "agregar":
            chatsSection.insertAdjacentHTML(
                "afterbegin",
                ponerChatResumenEnPantalla(data.chatResumen)
            );
            for (let chatResumen of chatsSection.children) {
                if (chatResumen.id == data.chatResumen.chat_id) {
                    chatResumenes.set(chatResumen.id, chatResumen);
                    chatResumen.addEventListener("click", () =>
                        menajarClickChat(chatResumen)
                    );
                    break;
                }
            }
            break;
    }
};
socket.onopen = () => {
    socket.send(JSON.stringify(sesion));
};

const main = async () => {
    try {
        let chatsObjeto = await (
            await fetch(`${direcion}/getChats`, {
                method: "post",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(sesion),
            })
        ).json();
        if (chatsObjeto[0] == true) {
            redirigir("/login");
            throw new Error();
        }

        if (chatsObjeto[0] == false) {
            alert(
                "error al recoger los chats\nintenta iniciar sesion de nuevo " +
                    direcion
            );
            throw new Error();
        }
        for (let chatResumen of chatsObjeto) {
            chatsSection.innerHTML += ponerChatResumenEnPantalla(chatResumen);
        }
        chats = document.querySelectorAll(".chatResumen");
        for (let chat of chats) {
            chatResumenes.set(chat.id, chat);
            chat.addEventListener("click", () => {
                menajarClickChat(chat);
            });
        }
    } catch (err) {
        console.log(err);
    }
    botonEnviar.addEventListener("click", () => {
        if (nuevoMensaje.value) {
            document.querySelector("#sinMensaje").style.display = "none";
            let fechaActual = new Date();
            const mensaje = {
                usuario_id: sesion.id,
                sesion: sesion,
                texto: nuevoMensaje.value,
                fecha_hora: `${fechaActual.getFullYear()}-${
                    fechaActual.getMonth() + 1
                }-${fechaActual.getDate()} ${
                    ("0" + fechaActual.getHours()).slice(-2) +
                    ":" +
                    ("0" + fechaActual.getMinutes()).slice(-2) +
                    ":" +
                    ("0" + fechaActual.getSeconds()).slice(-2)
                }`,
                numeroMensaje: numeroDeMensaje++,
                chat_id: chatElegido.id,
            };
            ponerMensajeEnPantalla(mensaje);

            fetch(`${direcion}/mandarMensaje`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mensaje: mensaje, sesion: sesion }),
            })
                .then((res) => res.json())
                .then((result) => {
                    if (result[0] == true) {
                        redirigir("/login");
                        throw new Error();
                    }
                    if (!result.resultado) {
                        alert("error al mandar mensaje");
                        let mensajesActuales = mensajes.children;
                        for (let i = mensajesActuales.length - 1; i > 0; i--) {
                            if (
                                mensajesActuales[i].id == result.numeroDeMensaje
                            ) {
                                mensajesActuales[i].remove();
                            }
                        }
                    } else {
                        ponerUltimoMensaje(mensaje);
                        chatsSection.insertAdjacentElement(
                            "afterbegin",
                            chatElegido
                        );
                        // poner logo de que se mando
                    }
                })
                .catch((err) => console.log(err));
        }
    });
};

async function getYpintar_mensajes() {
    try {
        const chat = await (
            await fetch(`${direcion}/getChat`, {
                method: "post",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                    idChat: chatElegido.id,
                    sesion: sesion,
                }),
            })
        ).json();

        if (!chat[0] || chat[0] == true || !chat[chat.length - 1].texto) {
            document.querySelector("#sinMensaje").style.display = "block";
        }

        for (let mensaje of chat) {
            if (mensaje.texto) {
                mensaje.fecha_hora = mensaje.fecha_hora
                    .replace("T", " ")
                    .split(".")[0];
                ponerMensajeEnPantalla(mensaje);
            }
        }
        console.log(chat[chat.length - 1]);
        if (chat[chat.length - 1].usuario_id != sesion.id) {
            setLeido(chatElegido.id);
        }
    } catch (err) {
        console.log(err);
        alert("error al recojer los mensajes");
    }
}

function setLeido(idChat) {
    fetch(`${direcion}/setLeido`, {
        method: "post",
        headers: { "Content-type": "applicaion/json" },
        body: JSON.stringify({
            idChat: idChat,
            sesion: sesion,
        }),
    });
}

const ponerMensajeEnPantalla = (mensaje) => {
    mensajes.innerHTML += `
        <div class="${
            sesion.id == mensaje.usuario_id ? "mensaje1" : "mensaje2"
        }" ${
        mensaje.numeroMensaje != undefined
            ? `id="${mensaje.numeroMensaje}"`
            : ""
    }>
            <p>${mensaje.texto}</p><p>${mensaje.fecha_hora}</p>
        </div>`;
    mensajes.scrollTop = mensajes.scrollHeight;
};
const ponerUltimoMensaje = (mensaje) => {
    document.querySelector(`#ultimoMensaje${mensaje.chat_id}`).textContent =
        mensaje.texto;
};
function ponerChatResumenEnPantalla(chatResumen) {
    return `
    <div class="chatResumen" id="${chatResumen.chat_id}" ${
        chatResumen.ultimoMensaje &&
        chatResumen.mensajeEmisorId != sesion.id &&
        !chatResumen.leido
            ? 'style="background-color: purple"'
            : ""
    }>
        <img src="${
            chatResumen.foto ? chatResumen.foto : fotoPredeterminada
        }" onerror="ponerFotoPrederteminada(this)" 
            class="fotoPerfil">
        <h3>${chatResumen.nombre}</h3>
        <p id="ultimoMensaje${chatResumen.chat_id}">
            ${chatResumen.ultimoMensaje ? chatResumen.ultimoMensaje : ""}
        </p>
    </div>`;
}

function ponerFotoPrederteminada(img) {
    img.src = fotoPredeterminada;
}
function menajarClickChat(chat) {
    chat.removeAttribute("style");
    mensajes.innerHTML = '<p id="sinMensaje">sin mensajes</p>';
    chatElegido = chat;
    getYpintar_mensajes();
    chatHead.style.display = "flex";
    inputTexto.style.display = "block";
    chatHead.children[0].src = chat.children[0].src;
    chatHead.children[1].textContent = chat.children[1].textContent;
}
function redirigir(url) {
    window.location.href = direcion + url;
}
main();
