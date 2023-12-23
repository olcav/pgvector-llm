import {client, findTopKEmbeddingsWithTags, openai, sendPrompt, sendPromptWithRag} from "./utils.ts";

const tags = [
  ["songs"],
  ["bio"],
  ["songs", "bio"]
];

async function queryWithTags(prompt: string, t: string[]) {
    const topKDocuments = await findTopKEmbeddingsWithTags(prompt, 0.7, 3, t);
    const answer = await sendPromptWithRag(topKDocuments, prompt);
    console.log("Tags: ", t.join(","));
    console.log("Answer: ", answer);
}

export async function pgVectorRagWithTags() {
    await client.connect();
    const prompt = 'Décris moi Carlos'
    const queryTags = [];
    for(const t of tags){
        queryTags.push(queryWithTags(prompt, t))
    }
    await Promise.all(queryTags);
}

pgVectorRagWithTags().catch(e => console.error(e));
