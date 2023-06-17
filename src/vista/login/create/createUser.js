
const contrasenna = document.querySelector("#contrasenna")
const confirmarContrasenna = document.querySelector("#confirmarContrasenna")
const submit = document.querySelector("#crear")
submit.disable = true

submit.addEventListener("click", (event) => {
    //todo comprobaciones de nombre
    if (submit.disable) {
        event.preventDefault()
    }
})

const confirmar = () => {
    submit.disable = contrasenna.value != confirmarContrasenna.value
}

confirmarContrasenna.addEventListener("keyup", () => {
    confirmar()
    contrasenna.addEventListener("keyup", confirmar)
})