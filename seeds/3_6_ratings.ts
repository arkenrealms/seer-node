import Rating from '../src/models/rating'

export const data = [
    {
        status: 'active',
        meta: {}
    }
]

export const seed = async function (knex): Promise<any> {
    console.log('[DB] Seeding ratings')

    await knex('ratings').del()

    await Rating
        .query(knex)
        .upsertGraph(data)
}
