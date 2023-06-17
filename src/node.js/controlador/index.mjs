import { createServer } from "http"
import { readFileSync } from "fs";
import { comprobarUsuario, crearUsuario } from "../modelo/TUsuario.mjs";
import { getChats } from "../modelo/TChats.mjs";

let usuarioIniciado
export const direcion = "http://localhost:3000"
const server = createServer((req, res) => {
    if (req.method == "GET" && req.url != "/favicon.ico") {
        controladorGet(req.url, res)
    } else if (req.method == "POST") {
        controladorPost(req, res)
    }
})

async function controladorGet(url, res) {
    let respuesta
    let urlCompleta = url.split('?')
    url = urlCompleta[0].split('.')
    switch (url[0]) {
        case "/": case "/index":
            respuesta = leerArchivo(`../../vista/index/index.`, url[1])
            break;
        case "/login":
            respuesta = leerArchivo(`../../vista/login/login.`, url[1])
            break;
        case "/login/createUser":
            respuesta = leerArchivo(`../../vista/login/create/createUser.`, url[1])
            break;
        case "/agregar": 
            respuesta = leerArchivo(`../../vista/agregar/agregar.`, url[1])
            break;
        case "/getChats":
            try { // es para que no se pare 
                respuesta = JSON.stringify(await getChats(usuarioIniciado.id))
            } catch (err) {
                respuesta = '[]'
            }
            break;
        default:
            respuesta = leerArchivo(`../../vista/notFound/notFound.`, url[1])
            break;
    }

    for (let i = 1; i < urlCompleta.length; i++) {
        let [clave, valor] = urlCompleta[i].split('=')
        console.log(clave)
        switch (clave) {
            case 'mensaje':
                valor = valor.split('%20').join(' ')
                console.log(valor)
                respuesta += `<script>alert("${valor}")</script>`
                break;
        }
    }
    res.end(respuesta)
}

async function controladorPost(req, res) {
    switch (req.url) {
        case "/login/create":
            let nuevoUsuario = await recibirForm(req)
            if (crearUsuario(nuevoUsuario)) {
                redirigirConAlerta('/login', 'usuario creado con exito', res)
            } else {
                redirigirConAlerta('/login/create', 'error al crear', res)
            }
            break;
        case "/login":
            let usuario = await recibirForm(req)
            let result = await comprobarUsuario(usuario)
            if (result) {
                redirigir('/', res)
                usuarioIniciado = result
            } else {
                if (result == undefined) {
                    redirigirConAlerta('/login', 'nombre o contrasenna incorrecta', res)
                } else {
                    redirigirConAlerta('/login', "error al iniciar", res)
                }
            }
            break
    }
}

function redirigir(url, res) {
    res.writeHead(302, { 'Location': direcion + url })
    res.end()
}

function redirigirConAlerta(url, mensaje, res) {
    const urlCompleto = url + '?mensaje=' + mensaje
    redirigir(urlCompleto, res)
}

function recibirDatos(req) {
    return new Promise(resolve => {
        let datos = ""
        req.on('data', (chunk) => {
            datos += chunk
        })
        req.on('end', () => {
            return resolve(datos)
        })
    })
}

async function recibirForm(req) {
    const datos = await recibirDatos(req)
    let objeto = {}
    datos.split("&").forEach(pareja => {
        const [clave, valor] = pareja.split("=")
        objeto[clave] = valor
    })
    return objeto
}

function leerArchivo(url, extension) {
    let respuesta
    try {
        url += (extension)? extension: "html"
        respuesta = readFileSync(url, "utf-8")
    } catch (err) {
        respuesta = "error"
        console.log(err)
    }
    return respuesta
}

server.listen(3000, () => {
    console.log("escuchando en el puerto 3000")
})