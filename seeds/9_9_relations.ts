import Node from '../src/models/node'
import Product from '../src/models/product'
import Tag from '../src/models/tag'


export const seed = async function (knex): Promise<any> {
    console.log('[DB] Building relationships')

    const data = [
        {
            fromProductId: (await Product.query(knex).limit(1))[0].id,
            toTagId: (await Tag.query(knex).limit(1))[0].id, //await Tag.query().findById(1),
            relationKey: 'tags',
            meta: {}
        }
    ]

    await Node
        .query(knex)
        .upsertGraph(data, {
        })
}
