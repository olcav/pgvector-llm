import {Client} from "pg";
import {OpenAI} from "openai";

export function getPgClient(){
    return new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
    });
}

export async function getEmbedding(openai: OpenAI, text: string): Promise<Array<number>> {
    try {
        const response = await openai.embeddings.create({
            input: text,
            model: "text-embedding-ada-002"
        });
        return response.data[0]["embedding"];
    } catch (error) {
        console.error('Erreur lors de la récupération des embeddings:', error);
        return [];
    }
}

export function getOpenAI(): OpenAI {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
        timeout: 30000
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
