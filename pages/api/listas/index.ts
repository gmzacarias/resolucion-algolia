import type { NextApiRequest, NextApiResponse } from "next";
import { getOffsetAndLimit } from "lib/request";
import { getLista} from "../utils/index"

export default function (req: NextApiRequest, res: NextApiResponse) {
    const lista = getLista()
    const { offset, limit } = getOffsetAndLimit(req, 100, lista.length)
    console.log(lista.length)
    const slicedList = lista.slice(offset, offset + limit)
    //offset= 10
    //limit =5
    //resultado= a partir del 10 hasta el 15(offset + limit)
    res.send({
        results: slicedList,
        pagination: {
            offset: offset,
            limit: limit,
            total: lista.length,
        }
    })
}