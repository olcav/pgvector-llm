import {Client} from "pg";
import {OpenAI} from "openai";

export const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
});

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    timeout: 30000
});

export async function getEmbedding(text: string): Promise<Array<number>> {
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

export function createChunksTable(client: Client) {
    return client.query(`
        CREATE TABLE IF NOT EXISTS chunks
        (
            id        SERIAL PRIMARY KEY,
            text      TEXT,
            embedding VECTOR(1536),
            enabled   BOOLEAN DEFAULT TRUE
        );
    `);
}


export async function findTopKEmbeddings(text: string, score: number, topK: number): Promise<any> {
    const embedding = await getEmbedding(text);
    const result = await client.query(
        `SELECT 1 - (embedding <=> $1) as score,
                *
         FROM chunks
         WHERE enabled = true
           AND 1 - (embedding <=> $1) >= $2
         ORDER BY score
                 DESC
         LIMIT $3`,
        ["[" + embedding.join(",") + "]", score, topK]
    )
    return result.rows;
}

