const confirmarContrasenna = document.querySelector("#confirmarContrasenna");
const submit = document.querySelector("#crear");
const inputSesion = documet.querySelector("#sesion");
submit.disable = true;

submit.addEventListener("click", (event) => {
    //todo comprobaciones de nombre
    if (submit.disable) {
        event.preventDefault();
    }
});

const confirmar = () => {
    submit.disable = contrasenna.value != confirmarContrasenna.value;
};

confirmarContrasenna.addEventListener("input", () => {
    // todo poner colores de que no conciden las contraseñas
    confirmar();
    contrasenna.addEventListener("input", confirmar);
});
