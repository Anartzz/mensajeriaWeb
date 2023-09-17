const fotoPerfil = document.querySelector("#fotoPerfil");
let sesion = JSON.parse(localStorage.getItem("sesion"));
const inputFoto = document.querySelector("#inputFoto");
const guardarFoto = document.querySelector("#guardarFoto");
let direcion = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
let fotoAnterior;
let fotoPredeterminada = "../imagenes/fotoPerfilPredeterminado.jpg";

fotoPerfil.src = sesion.foto
    ? sesion.foto
    : "../imagenes/fotoPerfilPredeterminado.jpg";

fotoPerfil.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = (event) => {
        fotoPerfil.src = event.target.result;
    };

    reader.readAsDataURL(inputFoto.files[0]);
});

guardarFoto.addEventListener("click", async () => {
    console.log(inputFoto.files[0]);
    if (inputFoto.files[0] && inputFoto.files[0] != fotoAnterior) {
        fotoAnterior = inputFoto.files[0];
        let respuesta = await (
            await fetch(direcion + "/cambiarFoto", {
                method: "post",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    sesion: sesion,
                    imagen: fotoPerfil.src,
                }),
            })
        ).text();
        if (respuesta == "true") {
            localStorage.removeItem("sesion");
            window.location.href = direcion + "/login";
        } else if (respuesta == "false") {
            alert("error al guardar la imagen");
        } else {
            sesion.foto = respuesta;
            localStorage.setItem("sesion", JSON.stringify(sesion));
        }
    }
});

function ponerFotoPrederteminada(img) {
    img.src = fotoPredeterminada;
}
