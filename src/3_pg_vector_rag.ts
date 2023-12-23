import {client, findTopKEmbeddings, openai} from "./utils.ts";

export async function pgVectorRag(): Promise<String> {
    await client.connect();
    const prompt = 'Quel est le répertoire de Carlos et ses chansons ?'
    const topKDocuments = await findTopKEmbeddings(prompt, 0.6, 2);
    const ragPrompt =
        `Use the information between the <Document> tags to answer the question between the <Question> tag.
        ${topKDocuments.map((doc: any) => `<Document>${doc.text}</Document>`).join("\n")}
        <Question>${prompt}</Question>`
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: 'user',
                content: ragPrompt
            }
        ],
        temperature: 0.1,
    });
    return response.choices[0].message.content ?? '';
}

pgVectorRag()
    .then(answer => {
        console.log("Answer: ", answer);
    })
    .catch(e => console.error(e));
