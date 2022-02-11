import Event from '../src/models/event'

export const data = [
    {
        status: 'active',
        meta: {}
    }
]

export const seed = async function (knex): Promise<any> {
    console.log('[DB] Seeding events')

    await knex('events').del()

    await Event
        .query(knex)
        .upsertGraph(data)
}
