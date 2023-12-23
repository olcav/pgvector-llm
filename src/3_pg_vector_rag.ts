import {client, findTopKEmbeddings, sendPromptWithRag} from "./utils.ts";

export async function pgVectorRag(): Promise<String> {
    await client.connect();
    const prompt = 'Quel est le répertoire de Carlos et ses chansons ?'
    const topKDocuments = await findTopKEmbeddings(prompt, 0.6, 4);
    return await sendPromptWithRag(topKDocuments, prompt);
}

pgVectorRag()
    .then(answer => {
        console.log("Answer: ", answer);
    })
    .catch(e => console.error(e));
