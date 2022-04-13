import Airtable from 'airtable'
import { log, logError } from '@rune-backend-sdk/util'

async function getGames(app) {
  try {
    app.airtable.database('Game').select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 3,
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function(record) {
          log('Retrieved', record.get('name'))

          // app.airtable.database('Game').find(record.get('id'), function(err, record) {
          //     if (err) { console.error(err); return; }
          //     log('Retrieved', record.id);
          // })
      })

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    }, function done(err) {
      if (err) { console.error(err); return; }
    })
  } catch(e) {
    logError(e)
  }
}

async function getItemType(app, key) {
  const cache = {}

  if (cache[key]) return cache[key]

  const res = await app.airtable.database('ItemType').find(key)

  cache[key] = {
    id: res.get('id'),
    name: res.get('name')
  }

  return cache[key]
}

async function getItemSubType(app, key) {
  const cache = {}

  if (cache[key]) return cache[key]

  const res = await app.airtable.database('ItemSubType').find(key)

  cache[key] = {
    id: res.get('id'),
    name: res.get('name')
  }

  return cache[key]
}

async function getItemSpecificType(app, key) {
  const cache = {}

  if (cache[key]) return cache[key]

  const res = await app.airtable.database('ItemSpecificType').find(key)

  cache[key] = {
    id: res.get('id'),
    name: res.get('name')
  }

  return cache[key]
}

async function getItems(app) {
  const skillCache = {}
  const materialCache = {}

  try {
    const items = []

    const res = await app.airtable.database('Item').select({
      maxRecords: 200,
      view: "Published Only"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched items', records)

      for (const record of records) {
        // if (!record.get('isPublished')) continue

        const item = {} as any

        item.name = record.get('name')
        item.id = record.get('id')
        item.description = record.get('description')
        item.shortDescription = record.get('shortDescription')
        item.type = (await Promise.all((record.get('type') || []).map((key) => getItemType(app, key))))[0]?.name
        item.subType = (await Promise.all((record.get('subType') || []).map((key) => getItemSubType(app, key))))[0]?.name
        item.specificType = (await Promise.all((record.get('specificType') || []).map((key) => getItemSpecificType(app, key))))[0]?.name
        item.icon = record.get('image')?.[0]?.url
        item.skills = []
        item.materials = []

        const skillIds = record.get('skills')

        if (skillIds) {
          for (const skillId of skillIds) {
            // log('Fetching skill ', skillId)
  
            const record2 = skillCache[skillId] || await app.airtable.database('Skill').find(skillId)

            skillCache[skillId] = record2
  
            if (!record2) continue
  
            item.skills.push(record2.get('id'))
          }
        }

        const materialIds = record.get('materials')

        if (materialIds) {
          for (const materialId of materialIds) {
            // log('Fetching materials ', materialId)
  
            const record2 = materialCache[materialId] || await app.airtable.database('ItemMaterial').find(materialId)

            materialCache[materialId] = record2
  
            if (!record2) continue
  
            item.materials.push(record2.get('id'))
          }
        }

        items.push(item)
      }

      app.db.saveItems(items)
    })
    
    if (!res) {
      log('Error fetching items')
    }

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    // fetchNextPage()
  } catch(e) {
    logError(e)
  }
}


async function getSkills(app) {
  const itemCache = {}

  try {
    const skills = []

    app.airtable.database('Skill').select({
      maxRecords: 200,
      view: "All"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched skills', records)
      
      for (const record of records) {
        if (!record.get('isPublished')) continue

        const skill = {} as any

        skill.name = record.get('name')
        skill.id = record.get('id')
        skill.description = record.get('description')
        skill.shortDescription = record.get('shortDescription')
        skill.type = record.get('type')
        skill.icon = record.get('icon')?.[0]?.url
        skill.items = []

        const itemIds = record.get('items')

        if (itemIds) {
          for (const itemId of itemIds) {
            // log('Fetching item ', itemId)
  
            const record2 = itemCache[itemId] || await app.airtable.database('Item').find(itemId)

            itemCache[itemId] = record2
  
            if (!record2) continue
  
            const item = {} as any
  
            skill.items.push(record2.get('id'))
          }
        }

        skills.push(skill)
      }

      app.db.saveSkills(skills)
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    // fetchNextPage()
  } catch(e) {
    logError(e)
  }
}

export async function monitorAirtable(app) {
  try {
    app.airtable = {}
    app.airtable.apiKey = 'keybm28X0xKzSTmSG'

    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: app.airtable.apiKey
    })

    app.airtable.database = Airtable.base('appSk5DGjf8WaidIK');

    await getSkills(app)
    await getItems(app)

    setInterval(async () => await getSkills(app), 24 * 60 * 60 * 1000)
    setInterval(async () => await getItems(app), 7 * 24 * 60 * 60 * 1000)
  } catch(e) {
    logError(e)
  }
}