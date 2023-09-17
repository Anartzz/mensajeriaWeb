import { crearConexion } from "./bd.mjs";

export const crearUsuario = async (usuario) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            "insert into usuarios (nombre, contrasenna, foto) values (?,?,?)",
            [usuario.nombre, usuario.contrasenna, usuario.foto]
        );
        con.end();
        return result[0].affectedRows != 0;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const comprobarUsuario = async (usuario) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            "select * from usuarios where nombre = ? and contrasenna = ?",
            [usuario.nombre, usuario.contrasenna]
        );
        con.end();
        return result[0][0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const getUsuariosConLetra = async (letra, usuarioIniciado) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            `select u.nombre from usuarios u 
                where u.nombre like '%${letra}%' and 
                not exists (select 'x' from chats 
                                where (usuario1 = ? and usuario2 = u.id) or (usuario2 = ? and usuario1 = u.id))`,
            [usuarioIniciado.id, usuarioIniciado.id]
        );
        con.end();
        return result[0];
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const actualizarFotoPerfil = async (usuario, img) => {
    try {
        const con = await crearConexion();
        const result = await con.query(
            `update usuarios set foto = ? where id = ?`,
            [img, usuario.id]
        );
        con.end();
        return result[0].affectedRows != 0;
    } catch (err) {
        console.log(err);
        return false;
    }
};
