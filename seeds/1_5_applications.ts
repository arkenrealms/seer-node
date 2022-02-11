import Application from '../src/models/application'

export const data = [
    {
        status: 'active',
        name: 'App 1',
        meta: {
            description: null
        }
    },
    {
        status: 'active',
        name: 'App 2',
        meta: {
            description: null
        }
    },
    {
        status: 'active',
        name: 'App 3',
        meta: {
            description: null
        }
    }
]

export const seed = async function (knex): Promise<any> {
    console.log('[DB] Seeding applications')

    await knex('applications').del()
    //await knex.raw('TRUNCATE TABLE applications RESTART IDENTITY CASCADE')

    await Application
        .query(knex)
        .upsertGraph(data)
}
