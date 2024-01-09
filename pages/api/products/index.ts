import "dotenv/config"
import type { NextApiRequest, NextApiResponse } from "next";
import { getOffsetAndLimit } from "lib/request"
import { productIndex } from "lib/algolia"

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const { offset, limit } = getOffsetAndLimit(req)
    const results = await productIndex.search(req.query.search as string, {
        hitsPerPage: limit,
        page: offset > 1 ? Math.floor(offset / limit) : 0
    })
    res.send({
        results: results.hits,
        pagination: {
            offset,
            limit,
            total: results.nbHits,
        }
    })
}