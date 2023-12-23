import {createChunksTable, getEmbedding, getOpenAI, getPgClient} from "./utils.ts";

const client = getPgClient();

const openai = getOpenAI();

async function findTopKEmbeddings(text: string, score: number, topK: number): Promise<any> {
    const embedding = await getEmbedding(openai, text);
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

export async function queryEmbeddings() {
    await client.connect();
    await createChunksTable(client);
    return await findTopKEmbeddings("Quel est le répertoire de Carlos ?", 0.6, 2);
}

queryEmbeddings()
    .then(rows => {
        for(const row of rows){
            console.log("Score: ", row.score);
            console.log("Text: \n", row.text);
        }
    })
    .catch(e => console.error(e));
