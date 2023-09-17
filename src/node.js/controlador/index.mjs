import { createServer } from "http";
import { readFileSync, writeFileSync, unlink } from "fs";
import {
    actualizarFotoPerfil,
    comprobarUsuario,
    crearUsuario,
    getUsuariosConLetra,
} from "../modelo/TUsuario.mjs";
import {
    getChats,
    agregarUsuarios,
    getChat,
    getUsuarioDeChat,
    getUltimoMensaje,
    getIdChatYusario,
    getUsuariosAgregados,
} from "../modelo/TChats.mjs";
import { insertarMensaje, setLeido } from "../modelo/TMensajes_chat.mjs";
import { createHash } from "crypto";
import { WebSocketServer } from "ws";
let sesion;
let clientes = new Map();
let sockets = new Map();
const ip = "192.168.1.170";
const direcion = `http://${ip}:3000`;
const server = createServer((req, res) => {
    if (req.method == "GET" && req.url != "/favicon.ico") {
        controladorGet(req.url, res);
    } else if (req.method == "POST") {
        controladorPost(req, res);
    }
});

server.listen(3000, ip, () => {
    console.log("escuchando en " + direcion);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
    socket.on("message", async (mensaje) => {
        let sesion = JSON.parse(mensaje);
        sesion = await comprobarUsuario(sesion);
        if (sesion) {
            clientes.set(sesion.id, socket);
            sockets.set(socket, sesion.id);
        } else {
            socket.send(JSON.stringify({ accion: "error sesion" }));
        }
    });

    socket.on("close", () => {
        clientes.delete(sockets.get(socket));
        sockets.delete(socket);
    });
});

async function controladorGet(urlCompleta, res) {
    let respuesta;
    urlCompleta = urlCompleta.split("?");
    let url = urlCompleta[0].split(".");
    switch (url[1]) {
        case "png":
        case "jpeg":
        case "jpg":
        case "webp":
            respuesta = leerImagen(`../../vista${url[0]}.${url[1]}`);
            break;
        default:
            let direcion;
            switch (url[0]) {
                case "/":
                    url[0] = "/index";
                case "/index":
                case "/login":
                case "/agregar":
                case "/cuenta":
                case "/crearGrupo":
                case "/crearUsuario":
                    direcion = `../../vista${url[0]}${url[0]}.`;
                    break;
                default:
                    direcion = `../../vista/notFound/notFound.`;
                    break;
            }
            respuesta = leerArchivo(direcion, url[1]);
    }

    for (let i = 1; i < urlCompleta.length; i++) {
        let [clave, valor] = urlCompleta[i].split("=");
        switch (clave) {
            case "mensaje":
                valor = valor.split("%20").join(" ");
                respuesta += `<script>alert("${valor}")</script>`;
                break;
        }
    }
    res.end(respuesta);
}

async function controladorPost(req, res) {
    let respuesta = "";
    let datos;
    switch (req.url) {
        case "/crearUsuario":
            let nuevoUsuario = await recibirForm(req);
            nuevoUsuario.contrasenna = createHash("sha256")
                .update(nuevoUsuario.contrasenna)
                .digest("hex");

            if (await crearUsuario(nuevoUsuario)) {
                redirigirConAlerta("/login", "usuario creado con exito", res);
            } else {
                redirigirConAlerta("/login/createUser", "error al crear", res);
            }
            break;
        case "/login":
            let usuario = JSON.parse(await recibirDatos(req));
            usuario.contrasenna = createHash("sha256")
                .update(usuario.contrasenna)
                .digest("hex");
            let result = await comprobarUsuario(usuario);
            respuesta = JSON.stringify(result);
            break;
        case "/getUsuariosNoAgregados":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                respuesta = JSON.stringify(
                    await getUsuariosConLetra(datos.nombreUsuario, sesion)
                );
            } else {
                respuesta = "[true]";
            }
            break;
        case "/agregar":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);

            if (sesion) {
                respuesta = await agregarUsuarios(datos.usuarios, sesion);
                if (respuesta) {
                    for (let usuario of datos.usuarios) {
                        let ids = await getIdChatYusario(
                            usuario.nombre,
                            sesion.id
                        );
                        await insertarMensaje({
                            usuario_id: sesion.id,
                            chat_id: ids.chat_id,
                        });
                        let socket = clientes.get(ids.usuario_id);
                        if (socket) {
                            socket.send(
                                JSON.stringify({
                                    accion: "agregar",
                                    chatResumen: {
                                        chat_id: ids.chat_id,
                                        nombre: sesion.nombre,
                                        foto: sesion.foto,
                                    },
                                })
                            );
                        }
                    }
                }
                respuesta = JSON.stringify(respuesta);
            } else {
                respuesta = "[true]";
            }
            break;
        case "/getChats":
            sesion = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(sesion);
            if (sesion) {
                respuesta = JSON.stringify(await getChats(sesion.id));
            } else {
                respuesta = "[true]";
            }
            break;
        case "/getChat":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                respuesta = JSON.stringify(await getChat(datos.idChat, sesion));
            } else {
                respuesta = "[true]";
            }
            break;
        case "/getUltimoMensaje":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                respuesta = JSON.stringify(
                    await getUltimoMensaje(datos.idChat, sesion)
                );
            } else {
                respuesta = "[true]";
            }
            break;
        case "/mandarMensaje":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                datos.mensaje.usuario_id = sesion.id;
                let resultado = await insertarMensaje(datos.mensaje);
                respuesta = JSON.stringify({
                    resultado: resultado,
                    numberMensaje: datos.mensaje.numeroMensaje,
                });

                if (resultado) {
                    let idUsuario = await getUsuarioDeChat(datos.mensaje);
                    if (idUsuario) {
                        let socket = clientes.get(idUsuario);
                        if (socket) {
                            delete datos.mensaje.sesion;
                            delete datos.mensaje.numeroMensaje;
                            socket.send(
                                JSON.stringify({
                                    accion: "recibirMensaje",
                                    mensaje: datos.mensaje,
                                })
                            );
                        }
                    }
                }
            } else {
                respuesta = "[true]";
            }
            break;
        case "/setLeido":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                setLeido(datos.idChat, sesion);
                respuesta = "";
            }
            break;
        case "/cambiarFoto":
            datos = await JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(datos.sesion);
            if (sesion) {
                try {
                    datos.imagen = datos.imagen.split(",");
                    let imagenInfo = datos.imagen[0].split("/")[1].split(";");
                    let imagen = Buffer.from(datos.imagen[1], imagenInfo[1]);
                    let fechaActual = new Date();
                    fechaActual = `${fechaActual.getFullYear()}${fechaActual.getMonth()}${fechaActual.getDate()}${fechaActual.getHours()}${fechaActual.getHours()}${fechaActual.getMinutes()}${fechaActual.getSeconds()}`;
                    let nombreImg =
                        sesion.nombre +
                        createHash("sha256").update(fechaActual).digest("hex") +
                        "." +
                        imagenInfo[0];
                    writeFileSync("../../vista/imagenes/" + nombreImg, imagen);
                    respuesta = "imagenes/" + nombreImg;
                } catch (err) {
                    respuesta = "false";
                }
                if (respuesta != "false") {
                    if (!(await actualizarFotoPerfil(sesion, respuesta))) {
                        respuesta = "false";
                        unlink("../../vista/" + respuesta);
                    } else if (sesion.foto && sesion.foto != respuesta) {
                        unlink("../../vista/" + sesion.foto, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            } else {
                respuesta = "true";
            }
            break;
        case "/getUsuariosAgregados":
            sesion = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(sesion);
            if (sesion) {
                respuesta = JSON.stringify(await getUsuariosAgregados(sesion));
            } else {
                respuesta = "[true]";
            }
            break;
        case "/crearGrupo":
            datos = JSON.parse(await recibirDatos(req));
            sesion = await comprobarUsuario(sesion);
            if (sesion) {
                //respuesta = Json.stringify(await )
            } else {
                respuesta = "[true]";
            }
            break;
    }
    res.end(respuesta);
}

function redirigir(url, res) {
    res.writeHead(302, { Location: direcion + url });
}

function redirigirConAlerta(url, mensaje, res) {
    const urlCompleto = url + "?mensaje=" + mensaje;
    redirigir(urlCompleto, res);
}

function recibirDatos(req) {
    return new Promise((resolve) => {
        let datos = "";
        req.on("data", (chunk) => {
            datos += chunk;
        });
        req.on("end", () => {
            return resolve(datos);
        });
    });
}

async function recibirForm(req) {
    const datos = await recibirDatos(req);
    let objeto = {};
    datos.split("&").forEach((pareja) => {
        const [clave, valor] = pareja.split("=");
        objeto[clave] = valor;
    });
    return objeto;
}

function leerArchivo(url, extension) {
    let respuesta;
    try {
        url += extension ? extension : "html";
        respuesta = readFileSync(url, "utf-8");
    } catch (err) {
        respuesta = "error";
        console.log(err);
    }
    return respuesta;
}

function leerImagen(url) {
    let respuesta;
    try {
        respuesta = readFileSync(url);
    } catch (err) {
        respuesta = "error";
        console.log(err);
    }
    return respuesta;
}
