import {client, findTopKEmbeddings, findTopKEmbeddingsWithDate, openai} from "./utils.ts";

export async function pgVectorRagWithDates(): Promise<any[]> {
    await client.connect();
    const prompt = 'Quel est le répertoire de Carlos et ses chansons ?'
    return  await findTopKEmbeddingsWithDate(prompt, 0.6, 4, 0, 10);
}

pgVectorRagWithDates()
    .then(docs => {
        for(const doc of docs){
            console.log("Score: ", doc.original_score);
            console.log("Adjusted Score: ", doc.adjusted_score);
            console.log("Date: ", doc.indexing_date);
            console.log("Text: ", doc.text);
        }
    })
    .catch(e => console.error(e));
