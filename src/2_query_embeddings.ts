import {findTopKEmbeddings } from "./utils.ts";

export async function queryEmbeddings() {
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
