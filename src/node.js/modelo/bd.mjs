import { createConnection } from "mysql2/promise";

export const crearConexion = () => {
    return createConnection({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'mensajeriaweb'
    })
}