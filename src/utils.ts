import {Client} from "pg";

export function getPgClient(){
    return new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
    });
}

export function createChunksTable(client: Client){
    return client.query(`
        CREATE TABLE IF NOT EXISTS chunks
        (
            id      SERIAL PRIMARY KEY,
            text    TEXT,
            embedding VECTOR(1536),
            enabled BOOLEAN DEFAULT TRUE
        );
    `);
}
