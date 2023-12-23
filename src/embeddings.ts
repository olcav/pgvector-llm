import {OpenAI} from 'openai';
import {createChunksTable, getPgClient} from "./utils.ts";

const client = getPgClient();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    timeout: 30000
});

const texts = [
    `Jean-Chrysostome Dolto, plus connu sous son nom de scène Carlos, né le 20 février 1943 dans le 5e arrondissement 
    de Paris et mort le 17 janvier 2008 à Clichy, est un chanteur, acteur et fantaisiste français.`,
    `Incarnant la variété populaire, il est un ami proche de Dorothée, Eddie Barclay, Chantal Goya, Sim, Dave, Annie Cordy,
     Johnny Hallyday, Joe Dassin, Jeane Manson, Coluche et surtout Sylvie Vartan, qui lui permet de faire ses premiers pas 
     sur scène à ses côtés.`,
    `Son vaste répertoire est enjoué et festif, avec souvent une connotation grivoise lubrique, comme les chansons L
     Tirelipimpon, Papayou ou Big Bisou. Il est également populaire auprès des enfants, en étant le parrain de l'émission
      Club Dorothée et le héros du dessin animé Les Aventures de Carlos.`,
    `Doté d'un fort embonpoint et d'un visage naturellement débonnaire et jovial, Carlos adopte rapidement une allure
     propre (colliers de fleurs, chemises hawaïennes) similaire à celle d'un autre chanteur français, Antoine.`
];

async function getEmbedding(text: string): Promise<Array<number>> {
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

async function indexText(text: string) {
    const embeddings = await getEmbedding(text);
    await client.query('INSERT INTO chunks (text, embedding) VALUES ($1, $2)', [text, "[" + embeddings.join(",") + "]"]);
}

async function buildEmbeddings() {
    await client.connect();

    await createChunksTable(client);

    const chunksQueries: Promise<void>[] = [];
    for (const text of texts) {
        chunksQueries.push(indexText(text));
    }
    await Promise.all(chunksQueries);
}

buildEmbeddings().catch(e => console.error(e));
