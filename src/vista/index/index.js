const chatsSection = document.querySelector("#chats")
const linkAgregarUsuario = document.querySelector("#agregarUsuario")
let fotoPredeterminada = ""
linkAgregarUsuario.href =  `${window.location.protocol}//${window.location.hostname}:${window.location.port}/agregar`
fetch("http://localhost:3000/getChats")
    .then(res => res.json())
    .then(chats => {
        for (let chat of chats) {
            chatsSection.innerHTML += `
            <div class="chatResumen" id="${chat.id}">
                <img src="${(chat.foto) ? chat.foto : fotoPredeterminada}"
                <h3>${chat.nombre}</h3>
            </div>`
        }
    })
    .catch(() => alert('error al recoger los chats'))

