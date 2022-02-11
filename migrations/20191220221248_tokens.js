const defaults = (knex, table, options = {}) => {
    options = { status: true, timestamps: true, editors: true, owner: true, application: true, ...options }

    // table.charset(charset)
    // table.collate(collation)

    table.increments('id').primary()

    table.string('name', 100)
    table.index('name', `${table._tableName}_idx_name`)

    table.string('key', 100)
    table.index('key', `${table._tableName}_idx_key`)

    table.text('value')

    table.jsonb('meta').notNullable()

    if (options.status) {
        table.enum('status', ['active', 'disabled', 'removed']).defaultTo('active')

        table.index('status', `${table._tableName}_idx_status`)
    }

    if (options.application) {
        table
            .integer('applicationId')
            .unsigned()
            .references('id')
            .inTable('applications')
            .onDelete('SET NULL')
    }

    if (options.owner) {
        table
            .integer('ownerId')
            .unsigned()
            .references('id')
            .inTable('profiles')
            .onDelete('SET NULL')
    }

    if (options.editors) {
        table.integer('createdBy')
            .unsigned()
            .nullable()
            .references('profiles.id')
            .onUpdate('SET NULL')
            .onDelete('SET NULL')
        table.integer('editedBy')
            .unsigned()
            .nullable()
            .references('profiles.id')
            .onUpdate('SET NULL')
            .onDelete('SET NULL')
        table.integer('deletedBy')
            .unsigned()
            .nullable()
            .references('profiles.id')
            .onUpdate('SET NULL')
            .onDelete('SET NULL')
    }

    if (options.timestamps) {
        table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now())
        table.timestamp('updatedAt').nullable()
        table.timestamp('deletedAt').nullable()

        table.index(['createdAt', 'updatedAt'], `${table._tableName}_mul_timestamp`)
        table.index('deletedAt', `${table._tableName}_idx_deleted_at`)
    }
}

exports.up = knex => knex.schema
    .createTable('tokens', table => {
        defaults(knex, table)
        table.string('code', 100)
        // table.string('name', 100)
        table.string('type', 100)
        table.decimal('marketCap').unsigned()
        table.string('priceUsd', 100)
        table.string('priceBtc', 100)
        table.string('circulatingSupply', 100)
        table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // table.string('volume24h', 100)
        // code: String
        // name: String
        // type: String
        // marketCap: Float
        // priceUsd: Float
        // priceBtc: Float
        // circulatingSupply: Float
        // volume24h: Float
        // change24h: Float
        // change7d: Float
        // change1m: Float
        // change3m: Float
        // change6m: Float
        // change1y: Float
        // low24h: Float
        // high24h: Float
        // spread: Float
        // hackCount: Int
        // hackMentions: Int
        // volatilityRank: Float
        // basePair: BasePair
    })
    .createTable('markets', table => {
        defaults(knex, table)
    })
    .createTable('marketPairs', table => {
        defaults(knex, table)
        // code: String
        // name: String
    })
    .createTable('transactions', table => {
        defaults(knex, table)
    })
    .createTable('trades', table => {
        defaults(knex, table)
    })
    .createTable('tradeIdeas', table => {
        defaults(knex, table)
    })
    .createTable('exchanges', table => {
        defaults(knex, table)
        // name: String
        // tokenCount: Int
        // status: String
        // newsMentions: Int
        // hackMentions: Int
        // tokens: [Token]
    })

exports.down = knex => knex.schema
