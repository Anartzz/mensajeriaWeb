import { comprobarPertenecienteChat } from "./TChats.mjs";
import { crearConexion } from "./bd.mjs";

export const insertarMensaje = async (mensaje) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            "insert into mensajes_chat (usuario_id, chat_id, texto, fecha_hora) values (?, ?, ?, sysdate())",
            [
                parseInt(mensaje.usuario_id),
                parseInt(mensaje.chat_id),
                mensaje.texto,
                //mensaje.fecha_hora,
            ]
        );
        con.end();
        return result[0].affectedRows != 0;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const setLeido = async (chat_id, sesion) => {
    try {
        const con = await crearConexion();
        const pertenece = await comprobarPertenecienteChat(chat_id, sesion);
        if (!pertenece) {
            throw new Error("no pertence");
        }
        con.query(
            "update mensajes_chat set leido = 1 where chat_id = ? and leido = 0 and usuario_id != ?",
            [parseInt(chat_id), sesion.id]
        );
        con.end();
    } catch (err) {
        console.log(err);
    }
};
