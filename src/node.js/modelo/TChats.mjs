import { crearConexion } from "./bd.mjs";

export const getChats = async (idUsuario) => {
    try {
        const con = await crearConexion();
        const chats = await con.query(
            `select distinct c.id chat_id, u.nombre, u.foto, m.texto ultimoMensaje, m.fecha_hora fechaUltimo, m.leido, m.usuario_id mensajeEmisorId from chats c, usuarios u, mensajes_chat m 
                where ((c.usuario1 = ? and c.usuario2 = u.id) or (c.usuario1 = u.id and c.usuario2 = ?))
                and (m.id = (select max(id) from mensajes_chat where chat_id = c.id)) order by m.id desc`,
            [idUsuario, idUsuario]
        );
        con.end();
        return chats[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const agregarUsuarios = async (usuarios, usuarioIniciado) => {
    try {
        const con = await crearConexion();
        let insert = "insert into chats (usuario1, usuario2) values ";
        for (let usuario of usuarios) {
            insert += `(${usuarioIniciado.id}, (select id from usuarios where nombre = '${usuario.nombre}')),`;
        }
        insert = insert.slice(0, -1);
        const result = await con.query(insert);
        con.end();
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const getChat = async (idChat, usuarioIniciado) => {
    try {
        const con = await crearConexion();
        const chat = await con.query(
            `select mensajes_chat.* from mensajes_chat, chats c 
                where chat_id = ? and c.id = chat_id and 
                (usuario1 = ? or usuario2 = ?) order by fecha_hora`,
            [parseInt(idChat), usuarioIniciado.id, usuarioIniciado.id]
        );
        con.end();
        console.log(chat[0]);
        return chat[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const getUsuarioDeChat = async (mensaje) => {
    try {
        const con = await crearConexion();
        const idUsuario = await con.query(
            "select u.id from chats c, usuarios u where c.id = ? and (u.id = usuario1 or u.id = usuario2) and u.id != ?",
            [mensaje.chat_id, mensaje.usuario_id]
        );
        con.end();
        return idUsuario[0][0].id ? idUsuario[0][0].id : false;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const comprobarPertenecienteChat = async (chat_id, usuarioIniciado) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            "select 'x' from chats where id = ? and (usuario1 = ? or usuario2 = ?)",
            [parseInt(chat_id), usuarioIniciado.id, usuarioIniciado.id]
        );
        return result[0][0] != undefined;
    } catch (err) {
        console.log(err);
        return false;
    }
};
export const getUltimoMensaje = async (idChat, usuarioIniciado) => {
    try {
        const con = await crearConexion();
        const chat = await con.query(
            `select mensajes_chat.* from mensajes_chat, chats c 
                where chat_id = ${idChat} and c.id = ? and 
                (usuario1 = ? or usuario2 = ?) and fecha_hora = (select max(fecha_hora) from mensajes_chat where chat_id = ?)`,
            [
                parseInt(idChat),
                usuarioIniciado.id,
                usuarioIniciado.id,
                parseInt(idChat),
            ]
        );
        con.end();
        return chat[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const getIdChatYusario = async (usuario1nombre, usuario2id) => {
    try {
        const con = await crearConexion();
        const idChat = await con.query(
            "select c.id chat_id, u.id usuario_id from chats c, usuarios u where ((usuario1 = ? and usuario2 = u.id) or (usuario1 = u.id and usuario2 = ?)) and u.nombre = ?",
            [usuario2id, usuario1nombre, usuario1nombre, usuario2id]
        );
        return idChat[0][0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const getUsuariosAgregados = async (sesion) => {
    try {
        const con = await crearConexion();
        const usuarios = await con.query(
            "select u.nombre, u.foto from chats c, usuarios u where (c.usuario1 = ? or c.usuario2 = ?) and u.id != ? and (c.usuario1 = u.id or c.usuario2 = u.id) order by u.nombre ",
            [parseInt(sesion.id), parseInt(sesion.id), parseInt(sesion.id)]
        );
        return usuarios[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};
