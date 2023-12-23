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


export async function findTopKEmbeddings(text: string, score: number, topK: number): Promise<any[]> {
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


export async function findTopKEmbeddingsWithDate(
    text: string,
    score: number,
    topK: number,
    delayDays: number,
    gaussianSize: number): Promise<any[]> {
    const embedding = await getEmbedding(text);
    const result = await client.query(
        `WITH Scores AS (
            SELECT *,
                   1 - (embedding <=> $1) AS original_score,
                   EXTRACT(DAY FROM CURRENT_DATE - indexing_date) AS days_diff
            FROM chunks
            WHERE enabled = true
        )
         SELECT *,
                original_score,
                CASE
                    WHEN days_diff >= $4 THEN original_score * EXP(-0.5 * ((days_diff - $4) / $5) ^ 2)
                    ELSE original_score
                    END AS adjusted_score
         FROM Scores
         WHERE adjusted_score >= $2
         ORDER BY adjusted_score DESC
         LIMIT $3`,
        ["[" + embedding.join(",") + "]", score, topK, delayDays, gaussianSize]
    )
    return result.rows;
}

