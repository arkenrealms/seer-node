import Airtable from 'airtable'
import { log, logError } from '@rune-backend-sdk/util'
import { RuneNames, Games, ClassIdByName, ClassNames, SkillNames, ItemRarityNameById, RuneId, SkillIdByName, ConditionIdByName, StatIdByName, ModIdByName, TypeIdByName, ConditionNames, ConditionParamNames, EffectNames, StatNames, ModNames, TypeNames } from '@rune-backend-sdk/data/items'
import Skills from '../../db/skills.json'


function pad(n, width, z = '0') {
  const nn = n + ''
  return nn.length >= width ? nn : new Array(width - nn.length + 1).join(z) + nn
}

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

async function getItem(app, key) {
  const skillCache = {}
  const materialCache = {}

  if (!app.airtable.cache.getItem) app.airtable.cache.getItem = {}

  if (app.airtable.cache.getItem[key]) return app.airtable.cache.getItem[key]

  const record = await app.airtable.database('Item').find(key)

  const recipe = (await Promise.all((record.get('recipe') || []).map((key) => getItemRecipe(app, key))))[0]
  
  const item = {} as any

  const type = (await Promise.all((record.get('type') || []).map((key) => getItemType(app, key))))[0]
  const subType = (await Promise.all((record.get('subType') || []).map((key) => getItemSubType(app, key))))[0]
  const specificType = (await Promise.all((record.get('specificType') || []).map((key) => getItemSpecificType(app, key))))[0]
  
  item.id = record.get('id')
  item.name = record.get('name')
  item.icon = `https://rune.game/images/items/${pad(item.id, 5)}.png`
  item.image = record.get('image')?.[0]?.url
  item.value = '0',
  item.type = type?.id
  item.subType = subType?.id
  item.specificType = specificType?.id
  item.slots = type?.slots
  item.isPolled = !!record.get('isPolled')
  item.isNew = !!record.get('isNew')
  item.isSecret = !!record.get('isSecret')
  item.isUltraSecret = !!record.get('isUltraSecret')
  item.isPaused = !!record.get('isPaused')
  item.isRetired = !!record.get('isRetired')
  item.isDisabled = !!record.get('isEnabled')
  item.isCraftable = !!record.get('isCraftable')
  item.isEnabled = !!record.get('isEnabled')
  item.isDisabled = !record.get('isEnabled')
  item.isEquipable = !!record.get('isEquipable')
  item.isUnequipable = !!record.get('isUnequipable')
  item.isTradeable = !!record.get('isTradeable')
  item.isTransferable = !!record.get('isTransferable')
  item.isUpgradable = !!record.get('isUpgradable')
  item.isPublishable = !!record.get('isPublishable')
  item.isRuneword = !!record.get('isRuneword')
  item.createdDate = record.get('createdDate') || 0
  item.hotness = record.get('hotness') || 0
  item.numPerfectionRolls = record.get('numPerfectionRolls')
  item.attributes = []
  item.details = {
    Type: type?.name || '',
    Subtype: specificType?.name || '',
    'Rune Word': recipe?.runes.map(r => r.name.replace(' Rune', '')).join(' ') || '',
    Distribution: record.get('distribution') || '',
    Date: record.get('date') || '',
    'Max Supply': record.get('maxSupply') || '',
  }
  item.recipe = {
    requirement: recipe?.runes.map(r => ({
      id: r.id - 1,
      quantity: 1
    })) || []
  }
  item.description = (record.get('description') || '').replace(/\n$/g, '')
  item.shortDescription = (record.get('shortDescription') || '').replace(/\n$/g, '')
  item.visualDescription = (record.get('visualDescription') || '').replace(/\n$/g, '')
  item.branches = await getItemBranches(app, record)

  item.skills = []// (await Promise.all((record.get('skills') || []).map(async (key) => (await app.airtable.database('Skill').find(key)).get('id'))))
  item.materials = [] //(await Promise.all((record.get('materials') || []).map(async (key) => (await app.airtable.database('ItemMaterial').find(key)).get('id'))))

  if (item.isSecret || item.isUltraSecret) {
    delete item.details['Rune Word']
  }

  for (const detail in item.details) {
    if (item.details[detail] === '') {
      delete item.details[detail]
    }
  }

  const ItemType = {
    None: 0,
    OneHandedWeapon: 1,
    TwoHandedWeapon: 2,
    Shield: 3,
    Arrow: 4,
    Helm: 5,
    Pet: 6,
    BodyArmor: 7,
    LegArmor: 8,
    Glove: 9,
    Belt: 10,
    Boot: 11,
    Ring: 12,
    Amulet: 13,
    Trinket: 14,
    Consumable: 15,
    Gem: 16,
    Rune: 17,
    Ingredient: 18,
    Quest: 19,
    Undercloth: 20,
    Mount: 21,
    Key: 22,
    Container: 23,
    WristArmor: 24,
    Misc: 25,
  }

  const itemTypeToCategory = {
    [ItemType.None]: 'accessory',
    [ItemType.OneHandedWeapon]: 'weapon',
    [ItemType.TwoHandedWeapon]: 'weapon',
    [ItemType.Shield]: 'shield',
    [ItemType.Arrow]: 'accessory',
    [ItemType.Helm]: 'armor',
    [ItemType.Pet]: 'accessory',
    [ItemType.BodyArmor]: 'armor',
    [ItemType.LegArmor]: 'armor',
    [ItemType.Glove]: 'armor',
    [ItemType.Belt]: 'armor',
    [ItemType.Boot]: 'armor',
    [ItemType.Ring]: 'accessory',
    [ItemType.Amulet]: 'accessory',
    [ItemType.Trinket]: 'accessory',
    [ItemType.Consumable]: 'accessory',
    [ItemType.Gem]: 'accessory',
    [ItemType.Rune]: 'rune',
    [ItemType.Ingredient]: 'accessory',
    [ItemType.Quest]: 'accessory',
    [ItemType.Undercloth]: 'armor',
    [ItemType.Mount]: 'accessory',
    [ItemType.Key]: 'accessory',
    [ItemType.Container]: 'accessory',
    [ItemType.Misc]: 'accessory',
    [ItemType.WristArmor]: 'armor',
  }

  item.category = itemTypeToCategory[item.type] || 'accessory'

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

  app.airtable.cache.getItem[key] = item

  return app.airtable.cache.getItem[key]
}

async function getItemType(app, key) {
  if (!app.airtable.cache.getItemType) app.airtable.cache.getItemType = {}

  if (app.airtable.cache.getItemType[key]) return app.airtable.cache.getItemType[key]

  const record = await app.airtable.database('ItemType').find(key)

  app.airtable.cache.getItemType[key] = {
    id: record.get('id'),
    name: record.get('name'),
    slots: (await Promise.all((record.get('slots') || []).map((key) => getItemSlot(app, key)))).map(s => s.id)
  }

  return app.airtable.cache.getItemType[key]
}

async function getItemSlot(app, key) {
  if (!app.airtable.cache.getItemSlot) app.airtable.cache.getItemSlot = {}

  if (app.airtable.cache.getItemSlot[key]) return app.airtable.cache.getItemSlot[key]

  const record = await app.airtable.database('ItemSlot').find(key)

  app.airtable.cache.getItemSlot[key] = {
    id: record.get('id'),
    name: record.get('name')
  }

  return app.airtable.cache.getItemSlot[key]
}

async function getItemSubType(app, key) {
  if (!app.airtable.cache.getItemSubType) app.airtable.cache.getItemSubType = {}

  if (app.airtable.cache.getItemSubType[key]) return app.airtable.cache.getItemSubType[key]

  const record = await app.airtable.database('ItemSubType').find(key)

  app.airtable.cache.getItemSubType[key] = {
    id: record.get('id'),
    name: record.get('name')
  }

  return app.airtable.cache.getItemSubType[key]
}

async function getItemSpecificType(app, key) {
  if (!app.airtable.cache.getItemSpecificType) app.airtable.cache.getItemSpecificType = {}

  if (app.airtable.cache.getItemSpecificType[key]) return app.airtable.cache.getItemSpecificType[key]

  const record = await app.airtable.database('ItemSpecificType').find(key)

  app.airtable.cache.getItemSpecificType[key] = {
    id: record.get('id'),
    name: record.get('name')
  }

  return app.airtable.cache.getItemSpecificType[key]
}

async function getItemAttribute(app, key) {
  if (!app.airtable.cache.getItemAttribute) app.airtable.cache.getItemAttribute = {}

  if (app.airtable.cache.getItemAttribute[key]) return app.airtable.cache.getItemAttribute[key]

  const record = await app.airtable.database('ItemAttribute').find(key)

  app.airtable.cache.getItemAttribute[key] = {
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    game: record.get('game'),
    nexusLink: record.get('nexusLink'),
    paramType1: record.get('paramType1'),
    paramType2: record.get('paramType2'),
    paramType3: record.get('paramType3'),
    paramValue1: record.get('paramValue1'),
    paramValue2: record.get('paramValue2'),
    paramValue3: record.get('paramValue3'),
    nature: record.get('nature'),
    influences: record.get('influences'),
    description: record.get('description'),
  }

  return app.airtable.cache.getItemAttribute[key]
}

async function getItemRecipe(app, key) {
  if (!app.airtable.cache.getItemRecipe) app.airtable.cache.getItemRecipe = {}

  if (app.airtable.cache.getItemRecipe[key]) return app.airtable.cache.getItemRecipe[key]

  const record = await app.airtable.database('ItemRecipe').find(key)

  const recipe = {} as any

  const runes = [
    (await Promise.all((record.get('rune1') || []).map((key) => getRune(app, key))))[0],
    (await Promise.all((record.get('rune2') || []).map((key) => getRune(app, key))))[0],
    (await Promise.all((record.get('rune3') || []).map((key) => getRune(app, key))))[0],
    (await Promise.all((record.get('rune4') || []).map((key) => getRune(app, key))))[0],
    (await Promise.all((record.get('rune5') || []).map((key) => getRune(app, key))))[0],
  ].filter(r => !!r)

  recipe.id = record.get('id')
  recipe.name = record.get('name')
  recipe.runes = runes.map(r => ({
    id: r.id,
    quantity: 1
  }))
  recipe.description = record.get('description') || ''
  recipe.runes = runes

  app.airtable.cache.getItemRecipe[key] = recipe

  return app.airtable.cache.getItemRecipe[key]
}

async function getRune(app, key) {
  if (!app.airtable.cache.getRune) app.airtable.cache.getRune = {}

  if (app.airtable.cache.getRune[key]) return app.airtable.cache.getRune[key]

  const res = await app.airtable.database('Rune').find(key)

  app.airtable.cache.getRune[key] = {
    id: res.get('id'),
    name: res.get('name'),
    symbol: res.get('symbol')
  }

  return app.airtable.cache.getRune[key]
}

async function getItems(app) {
  log('Fetching airtable data: Item')

  try {
    const items = []

    const res = await app.airtable.database('Item').select({
      maxRecords: 500,
      view: "Enabled Only"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched items', records)

      for (const record of records) {
        try {
          // if (!record.get('isPublished')) continue
          const item = await getItem(app, record.id)

          console.log(item)

          items.push(item)

          // if (item.id > 50) break // temp
        } catch(e) {
          console.log(e)
        }
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

async function getSkillGame(app, key) {
  if (!app.airtable.cache.getSkillGame) app.airtable.cache.getSkillGame = {}

  if (app.airtable.cache.getSkillGame[key]) return app.airtable.cache.getSkillGame[key]

  const res = await app.airtable.database('Game').find(key)

  app.airtable.cache.getSkillGame[key] = {
    id: res.get('id'),
    name: res.get('name')
  }

  return app.airtable.cache.getSkillGame[key]
}


async function getSkills(app) {
  log('Fetching airtable data: Skill')

  const itemCache = {}

  try {
    const skills = []

    app.airtable.database('Skill').select({
      maxRecords: 200,
      view: "Published Only"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched skills', records)
      
      for (const record of records) {
        // if (!record.get('isPublished')) continue

        const skill = {} as any

        skill.name = record.get('name')
        skill.id = record.get('id')
        skill.description = record.get('description')
        skill.shortDescription = record.get('shortDescription')
        skill.game = (await Promise.all((record.get('game') || []).map((key) => getSkillGame(app, key))))[0]?.name
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


async function getStats(app) {
  log('Fetching airtable data: Stat')

  const itemCache = {}

  try {
    const skills = []

    app.airtable.database('Skill').select({
      maxRecords: 200,
      view: "Published Only"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched skills', records)
      
      for (const record of records) {
        // if (!record.get('isPublished')) continue

        const skill = {} as any

        skill.name = record.get('name')
        skill.id = record.get('id')
        skill.description = record.get('description')
        skill.shortDescription = record.get('shortDescription')
        skill.game = (await Promise.all((record.get('game') || []).map((key) => getSkillGame(app, key))))[0]?.name
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


function processItemAttributes(specs) {
  console.log(specs)
  const attributes = []
  const perfection = []

  for (const spec of specs) {
    if (!spec.attr?.id) {
      console.log('Warning: attribute doesnt have ID: ', spec.attr)
      continue
    }

    const attribute = {...spec.attr}

    const mapParamToId = {
      tokenId: (key) => RuneId[key],
      rune: (key) => RuneId[key], //RuneOnWinChance
      conditions: (key) => ConditionIdByName[key],
      skill: (key) => SkillIdByName[key],
      skills: (key) => SkillIdByName[key],
      stat: (key) => StatIdByName[key],
      stats: (key) => StatIdByName[key],
      mod: (key) => ModIdByName[key],
      type: (key) => TypeIdByName[key],
      classid: (key) => ClassIdByName[key],
    }
    const mapParamIdToReadable = {
      tokenId: (key) => RuneNames[key],
      rune: (key) => RuneNames[key], //RuneOnWinChance
      conditions: (key) => ConditionNames[key],
      conditionparams: (key) => ConditionParamNames[key],
      effect: (key) => EffectNames[key],
      skill: (key) => SkillNames[key],
      skills: (key) => SkillNames[key],
      stat: (key) => StatNames[key],
      stats: (key) => StatNames[key],
      mod: (key) => ModNames[key],
      type: (key) => TypeNames[key],
      classid: (key) => ClassNames[key],
    }
    const maps = {
      3: RuneNames,
      21: ClassNames,
      39: SkillNames,
      40: ItemRarityNameById
    }


    if (spec.param1) {
      const param = {} as any

      param.spec = spec.param1

      if (param.spec.indexOf('-') > 0) {
        const rawLeft = param.spec.split('-')[0]
        const rawRight = param.spec.split('-')[1]
  
        param.min = attribute.paramType1 in mapParamToId ? mapParamToId[attribute.paramType1](rawLeft) : parseFloat(rawLeft)
        param.max = attribute.paramType1 in mapParamToId ? mapParamToId[attribute.paramType1](rawRight) : parseFloat(rawRight)
      } else {
        param.min = attribute.paramType1 in mapParamToId ? mapParamToId[attribute.paramType1](param.spec) : parseFloat(param.spec)
        param.max = param.min
      }

      const attr1min = attribute.paramValue1?.indexOf('-') > 0 ? parseFloat(attribute.paramValue1.split('-')[0]) : parseFloat(attribute.paramValue1)
      const attr1max = attribute.paramValue1?.indexOf('-') > 0 ? parseFloat(attribute.paramValue1.split('-')[1]) : parseFloat(attribute.paramValue1)
  
      if (param.min < attr1min)
        throw new Error(`Attribute ${spec.attr.name} min smaller than ${attr1min}: ` + JSON.stringify(param))

      if (param.max > attr1max)
        throw new Error(`Attribute ${spec.attr.name} max bigger than ${attr1max}: ` + JSON.stringify(param))

      if (param.min === param.max)
        param.value = param.min

      attribute.param1 = param

      if (maps[attribute.id]) {
        attribute.param1.map = {}

        for (let i = attribute.param1.min; i <= attribute.param1.max; i++) {
          attribute.param1.map[i] = maps[attribute.id][i]
        }
      }

      if (attribute.paramType1 in mapParamIdToReadable) {
        attribute.param1.map = {}

        for (let i = attribute.param1.min; i <= attribute.param1.max; i++) {
          if (!mapParamIdToReadable[attribute.paramType1]) {
            console.log(`Param type not found: ` + attribute.paramType1)
            continue
          }
          attribute.param1.map[i] = mapParamIdToReadable[attribute.paramType1](i)
        }
      }

      // attribute.min = param.min
      // attribute.max = param.max
      // attribute.value = param.value
      // attribute.map = attribute.param1?.map
    }

    if (spec.param2) {
      const param = {} as any

      param.spec = spec.param2

      if (param.spec.indexOf('-') > 0) {
        const rawLeft = param.spec.split('-')[0]
        const rawRight = param.spec.split('-')[1]
  
        param.min = attribute.paramType2 in mapParamToId ? mapParamToId[attribute.paramType2](rawLeft) : parseFloat(rawLeft)
        param.max = attribute.paramType2 in mapParamToId ? mapParamToId[attribute.paramType2](rawRight) : parseFloat(rawRight)
      } else {
        param.min = attribute.paramType2 in mapParamToId ? mapParamToId[attribute.paramType2](param.spec) : parseFloat(param.spec)
        param.max = param.min
      }

      const attr2min = attribute.paramValue2?.indexOf('-') > 0 ? parseFloat(attribute.paramValue2.split('-')[0]) : parseFloat(attribute.paramValue2)
      const attr2max = attribute.paramValue2?.indexOf('-') > 0 ? parseFloat(attribute.paramValue2.split('-')[1]) : parseFloat(attribute.paramValue2)
  
      if (param.min < attr2min)
        throw new Error(`Attribute ${spec.attr.name} min smaller than ${attr2min}: ` + JSON.stringify(param))

      if (param.max > attr2max)
        throw new Error(`Attribute ${spec.attr.name} max bigger than ${attr2max}: ` + JSON.stringify(param))

      if (param.min === param.max)
        param.value = param.min

      attribute.param2 = param

      if (attribute.paramType2 in mapParamIdToReadable) {
        attribute.param2.map = {}
  
        for (let i = attribute.param2.min; i <= attribute.param2.max; i++) {
          if (!mapParamIdToReadable[attribute.paramType2]) {
            console.log(`Param type not found: ` + attribute.paramType2)
            continue
          }
          attribute.param2.map[i] = mapParamIdToReadable[attribute.paramType2](i)
        }
      }
    }

    if (spec.param3) {
      const param = {} as any

      param.spec = spec.param3

      if (param.spec.indexOf('-') > 0) {
        const rawLeft = param.spec.split('-')[0]
        const rawRight = param.spec.split('-')[1]
  
        param.min = attribute.paramType3 in mapParamToId ? mapParamToId[attribute.paramType3](rawLeft) : parseFloat(rawLeft)
        param.max = attribute.paramType3 in mapParamToId ? mapParamToId[attribute.paramType3](rawRight) : parseFloat(rawRight)
      } else {
        param.min = attribute.paramType3 in mapParamToId ? mapParamToId[attribute.paramType3](param.spec) : parseFloat(param.spec)
        param.max = param.min
      }

      const attr3min = attribute.paramValue3?.indexOf('-') > 0 ? parseFloat(attribute.paramValue3.split('-')[0]) : parseFloat(attribute.paramValue3)
      const attr3max = attribute.paramValue3?.indexOf('-') > 0 ? parseFloat(attribute.paramValue3.split('-')[1]) : parseFloat(attribute.paramValue3)
  
      if (param.min < attr3min)
        throw new Error(`Attribute ${spec.attr.name} min smaller than ${attr3min}: ` + JSON.stringify(param))

      if (param.max > attr3max)
        throw new Error(`Attribute ${spec.attr.name} max bigger than ${attr3max}: ` + JSON.stringify(param))

      if (param.min === param.max)
        param.value = param.min

      attribute.param3 = param

      if (attribute.paramType3 in mapParamIdToReadable) {
        attribute.param3.map = {}
  
        for (let i = attribute.param3.min; i <= attribute.param3.max; i++) {
          if (!mapParamIdToReadable[attribute.paramType3]) {
            console.log(`Param type not found: ` + attribute.paramType3)
            continue
          }
          attribute.param3.map[i] = mapParamIdToReadable[attribute.paramType3](i)
        }
      }
    }

    const isBuff = !!attribute.nature?.includes('Buff')
    const isDebuff = !!attribute.nature?.includes('Debuff')

    attributes.push(attribute)
    perfection.push(attribute.param1?.min === attribute.param1?.max ? undefined : (isBuff ? attribute.param1?.max : (isDebuff ? attribute.param1?.min : undefined)))
  }

  return {
    attributes,
    perfection
  }
}

async function getItemBranches(app, record) {
  const branches = {
    [Games.Raid.id]: {
      attributes: [],
      perfection: [],
    },
    [Games.Evolution.id]: {
      attributes: [],
      perfection: [],
    },
    [Games.Infinite.id]: {
      attributes: [],
      perfection: [],
    },
    [Games.Guardians.id]: {
      attributes: [],
      perfection: [],
    },
    [Games.Sanctuary.id]: {
      attributes: [],
      perfection: [],
    },
  }

  branches[Games.Raid.id] = processItemAttributes([
    { attr: (await Promise.all((record.get('a1Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a1Param1Raid'), param2: record.get('a1Param2Raid') },
    { attr: (await Promise.all((record.get('a2Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a2Param1Raid'), param2: record.get('a2Param2Raid') },
    { attr: (await Promise.all((record.get('a3Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a3Param1Raid'), param2: record.get('a3Param2Raid') },
    { attr: (await Promise.all((record.get('a4Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a4Param1Raid'), param2: record.get('a4Param2Raid') },
    { attr: (await Promise.all((record.get('a5Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a5Param1Raid'), param2: record.get('a5Param2Raid') },
    { attr: (await Promise.all((record.get('a6Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a6Param1Raid'), param2: record.get('a6Param2Raid') },
    { attr: (await Promise.all((record.get('a7Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a7Param1Raid'), param2: record.get('a7Param2Raid') },
    { attr: (await Promise.all((record.get('a8Raid') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a8Param1Raid'), param2: record.get('a8Param2Raid') },
  ])

  branches[Games.Evolution.id] = processItemAttributes([
    { attr: (await Promise.all((record.get('a1Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a1Param1Evolution'), param2: record.get('a1Param2Evolution') },
    { attr: (await Promise.all((record.get('a2Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a2Param1Evolution'), param2: record.get('a2Param2Evolution') },
    { attr: (await Promise.all((record.get('a3Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a3Param1Evolution'), param2: record.get('a3Param2Evolution') },
    { attr: (await Promise.all((record.get('a4Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a4Param1Evolution'), param2: record.get('a4Param2Evolution') },
    { attr: (await Promise.all((record.get('a5Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a5Param1Evolution'), param2: record.get('a5Param2Evolution') },
    { attr: (await Promise.all((record.get('a6Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a6Param1Evolution'), param2: record.get('a6Param2Evolution') },
    { attr: (await Promise.all((record.get('a7Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a7Param1Evolution'), param2: record.get('a7Param2Evolution') },
    { attr: (await Promise.all((record.get('a8Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a8Param1Evolution'), param2: record.get('a8Param2Evolution') },
    { attr: (await Promise.all((record.get('a9Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a9Param1Evolution'), param2: record.get('a9Param2Evolution') },
    { attr: (await Promise.all((record.get('a10Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a10Param1Evolution'), param2: record.get('a10Param2Evolution') },
    { attr: (await Promise.all((record.get('a11Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a11Param1Evolution'), param2: record.get('a11Param2Evolution') },
    { attr: (await Promise.all((record.get('a12Evolution') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a12Param1Evolution'), param2: record.get('a12Param2Evolution') },
  ])

  branches[Games.Infinite.id] = processItemAttributes([
    { attr: (await Promise.all((record.get('a1Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a1Param1Infinite'), param2: record.get('a1Param2Infinite') },
    { attr: (await Promise.all((record.get('a2Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a2Param1Infinite'), param2: record.get('a2Param2Infinite') },
    { attr: (await Promise.all((record.get('a3Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a3Param1Infinite'), param2: record.get('a3Param2Infinite') },
    { attr: (await Promise.all((record.get('a4Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a4Param1Infinite'), param2: record.get('a4Param2Infinite') },
    { attr: (await Promise.all((record.get('a5Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a5Param1Infinite'), param2: record.get('a5Param2Infinite') },
    { attr: (await Promise.all((record.get('a6Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a6Param1Infinite'), param2: record.get('a6Param2Infinite') },
    { attr: (await Promise.all((record.get('a7Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a7Param1Infinite'), param2: record.get('a7Param2Infinite') },
    { attr: (await Promise.all((record.get('a8Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a8Param1Infinite'), param2: record.get('a8Param2Infinite') },
    { attr: (await Promise.all((record.get('a9Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a9Param1Infinite'), param2: record.get('a9Param2Infinite') },
    { attr: (await Promise.all((record.get('a10Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a10Param1Infinite'), param2: record.get('a10Param2Infinite') },
    { attr: (await Promise.all((record.get('a11Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a11Param1Infinite'), param2: record.get('a11Param2Infinite') },
    { attr: (await Promise.all((record.get('a12Infinite') || []).map((key) => getItemAttribute(app, key))))[0], param1: record.get('a12Param1Infinite'), param2: record.get('a12Param2Infinite') },
  ])

  return branches
}

async function getRecipes(app) {
  log('Fetching airtable data: ItemRecipe')

  const recipeCache = {}
  const itemCache = {}
  const skillCache = {}
  const materialCache = {}

  try {
    const recipes = []

    const res = await app.airtable.database('ItemRecipe').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      log('Fetched recipes', records)

      for (const record of records) {
        // if (!record.get('isPublished')) continue

        const recipe = await getItemRecipe(app, record.key)
  
          // recipe.item = (await Promise.all((record.get('item') || []).map((key) => getItem(app, key))))[0]
  
          // {
          //   id: 43,
          //   name: 'Thunderchild',
          //   category: ItemCategoriesType.WEAPON,
          //   icon: process.env.REACT_APP_PUBLIC_URL + 'images/items/00043.png',
          //   value: '0',
          //   isSecret: false,
          //   type: ItemType.TwoHandedWeapon,
          //   slots: [ItemSlot.LeftHand],
          //   isNew: true,
          //   isEquipable: true,
          //   isUnequipable: false,
          //   isTradeable: true,
          //   isTransferable: true,
          //   isUpgradable: true,
          //   isCraftable: false,
          //   isDisabled: true,
          //   isRuneword: true,
          //   createdDate: 0,
          //   hotness: 9,
          //   attributes: [],
          //   details: {
          //     Type: 'Hammer',
          //     Subtype: 'Fist of Eledon',
          //     'Rune Word': 'Shael Ist Zod Mal Um',
          //     Distribution: 'Crafted',
          //     Date: 'Feb 21, 2022 - Now',
          //     'Max Supply': 'Unknown',
          //   },
          //   recipe: {
          //     requirement: [
          //       { id: RuneId.SHAEL, quantity: 1 },
          //       { id: RuneId.IST, quantity: 1 },
          //       { id: RuneId.ZOD, quantity: 1 },
          //       { id: RuneId.MAL, quantity: 1 },
          //       { id: RuneId.UM, quantity: 1 },
          //     ],
          //   },
          //   description: [
          //     `Runic inscriptions have transformed this stone hammer into a brutal conduit of Eledon's divine will.`,
          //   ],
          //   branches: {
          //     [Games.Raid.id]: {
          //       attributes: [
          //         { ...ItemAttributes.HarvestYield, min: 15, max: 30 },
          //         { ...ItemAttributes.RaidTwoAttribute, min: 2, max: 4 },
          //         { ...ItemAttributes.RandomRuneBonus, min: 5, max: 10 },
          //         { ...ItemAttributes.HarvestBurn, min: 10, max: 10 },
          //         { ...ItemAttributes.HarvestFee, min: 5, max: 10 },
          //         { ...ItemAttributes.HarvestFeeToken, min: RuneId.SOL, max: RuneId.FAL },
          //         {
          //           ...ItemAttributes.AddSkill,
          //           min: SkillIdByName['Hidden'],
          //           max: SkillIdByName['Hidden'],
          //           map: SkillNames,
          //         },
          //       ],
          //       perfection: [25, 40, 10, 15, 10, undefined, undefined, undefined],
          //     },
          //     [Games.Evolution.id]: {
          //       attributes: [],
          //     },
          //     [Games.Infinite.id]: {
          //       attributes: [
          //         { ...ItemAttributes.IncreaseDamage, min: 20, max: 30, description: '{Value}% Increased Damage' }, // All
          //         { ...ItemAttributes.EffectChanceOnCondition, min: 1, max: 1, description: '{Value}% Stun Chance On Hit' }, // MovementSpeed
          //         { ...ItemAttributes.CastOnCondition, min: 1, max: 1, description: '{Value}% Cast Leap On Applying Stun' },
          //         { ...ItemAttributes.IncreaseStat, min: 10, max: 15, description: '{Value}% Increased Energy Regeneration' }, // Fire
          //         { ...ItemAttributes.IncreaseRankRewardBonus, min: 5, max: 10, description: '{Value}% Increased Rank Reward Bonus' }, // Runes
          //         { ...ItemAttributes.IncreaseGuildPrestigeGain, min: 10, max: 20, description: '{Value}% Increased Guild Prestige' }, // Runes
          //         { ...ItemAttributes.UnlockSkills, min: 493, max: 493, description: 'Unlock Skills: Storm Call, Leap' }, // 493 + 468
          //       ],
          //       perfection: [25, 15, 25, 18, 25, undefined, undefined, undefined],
          //     },
          //     [Games.Guardians.id]: {
          //       attributes: [],
          //     },
          //     [Games.Sanctuary.id]: {
          //       attributes: [],
          //     },
          //   },
          // }

        recipes.push(recipe)

        log('Fetched recipe', recipe)
      }

      app.db.saveRecipes(recipes)
    })
    
    if (!res) {
      log('Error fetching recipes')
    }

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
    app.airtable.cache = {}
    app.airtable.apiKey = 'keybm28X0xKzSTmSG'

    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: app.airtable.apiKey
    })

    app.airtable.database = Airtable.base('appSk5DGjf8WaidIK');

    // await getStats(app)
    // setInterval(async () => await getStats(app), 6 * 60 * 60 * 1000)

    // await getSkills(app)
    // setInterval(async () => await getSkills(app), 6 * 60 * 60 * 1000)

    // await getItems(app)
    // setInterval(async () => await getItems(app), 12 * 60 * 60 * 1000)

    await getItems(app)
    setInterval(async () => await getItems(app), 12 * 60 * 60 * 1000)
  } catch(e) {
    logError(e)
  }
}