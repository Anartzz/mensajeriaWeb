import { crearConexion } from "./bd.mjs";

export const getChats = async (idUsuario) => {
    try {
        const con = await crearConexion()
        const chats = await con.query('select c.id, u.nombre, u.foto from chats c, usuarios u where (c.usuario1 = ? or c.usuario2 = ?) and (c.usuario1 = u.id or c.usuario2 = u.id)', [idUsuario, idUsuario])
        con.end()    
        return chats[0]
    } catch (err) {
        console.log(err)
        return false
    }
}