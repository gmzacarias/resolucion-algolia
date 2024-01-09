import "dotenv/config"
import type { NextApiRequest, NextApiResponse } from "next";
import { productIndex } from "lib/algolia";
import { getOffsetAndLimit } from "lib/request";


const baseId = process.env.AIRTABLE_BASEID
const tableName = process.env.AIRTABLE_TABLENAME
const token = process.env.AIRTABLE_TOKEN

async function authAirtable(token) {
    let offset = 0
    let allRecords = [];
    while (true) {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?pageSize=10&offset=${offset}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        )
        const data = await response.json();
        console.log(data)
        const dataRecords = data.records;
        // Si no hay más registros, rompe el bucle
        if (!dataRecords || dataRecords.length === 0) {
            break;
        }
        // Agrega los registros actuales a la lista
        allRecords = [...allRecords, ...dataRecords];
        const objects = dataRecords.map((r) => {
            return {
                objectID: r.id,
                ...r.fields
            }
        })
        await productIndex.saveObjects(objects)
        console.log("siguiente pagina")
        // Imprime los IDs de los registros actuales
        // for (const r of dataRecords) {
        //     console.log(r.id);
        // }
        // console.log("pagina")
        if (!data.offset) {
            // Si no hay "offset" en la respuesta, no hay más registros, rompe el bucle
            break;
        }
        offset = data.offset;
    }
    return allRecords
}

export default async function products(req: NextApiRequest, res: NextApiResponse) {
    const { offset, limit } = getOffsetAndLimit(req, 100, 10000)
    try {
        const results = await authAirtable(token)

        res.send({
            results: results,
            pagination: {
                page: Math.floor(offset / limit),
                offset: offset,
                limit: limit,
                total: results.length,
            }
        })
    } catch (error) {
        console.error(error)
    }
}