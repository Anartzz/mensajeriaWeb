import { crearConexion } from './bd.mjs'

export const crearUsuario = async (usuario) => {
    try {
        const con = await crearConexion()
        const result = await con.query("insert into usuarios (nombre, contrasenna, foto) values (?,?,?)", [usuario.nombre, usuario.contrasenna, usuario.foto])
        con.end()
        return result[0].affectedRows != 0
    } catch (err) {
        console.log(err)
        return false
    }
}

export const comprobarUsuario = async (usuario) => {
    try {
        const con = await crearConexion()
        const result = await con.query("select * from usuarios where nombre = ? and contrasenna = ?", [usuario.nombre, usuario.contrasenna])
        return result[0][0]
    } catch (err) {
        console.log(err)
        return false
    }
}