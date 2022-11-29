import Airtable from 'airtable'
import jetpack from 'fs-jetpack'
import path from 'path'
import { log } from '@rune-backend-sdk/util'
import { RuneNames, Games, ClassIdByName, ClassNames, SkillNames, ItemTypeIdByName, ItemTypeNames, ItemRarityNameById, RuneId, SkillIdByName, ConditionIdByName, StatIdByName, ModIdByName, TypeIdByName, ConditionNames, ConditionParamNames, EffectNames, StatNames, ModNames, TypeNames } from '@rune-backend-sdk/data/items'
import Skills from '../../db/skills.json'

const db = jetpack.read(path.resolve('./db/airtable.json'), 'json') || {
  Rune: {},
  Game: {},
  GameInfo: {},
  Item: {},
  ItemAttribute: {},
  ItemRecipe: {},
  ItemMaterial: {},
  ItemAttributeParam: {},
  ItemParam: {},
  ItemSpecificType: {},
  ItemSubType: {},
  ItemType: {},
  ItemAffix: {},
  ItemSlot: {},
  ItemRarity: {},
  ItemSet: {},
  ItemTransmuteRule: {},
  Skill: {},
  SkillMod: {},
  SkillClassification: {},
  SkillCondition: {},
  SkillConditionParam: {},
  SkillStatusEffect: {},
  SkillTreeNode: {},
  CharacterGuild: {},
  CharacterRace: {},
  CharacterGender: {},
  CharacterFaction: {},
  CharacterClass: {},
  Character: {},
  CharacterType: {},
  CharacterAttribute: {},
  CharacterStat: {},
  CharacterTitle: {},
  CharacterSpawnRule: {},
  CharacterFightingStyle: {},
  CharacterNameChoice: {},
  CharacterMovementStasuse: {},
  CharacterPersonality: {},
  Area: {},
  AreaType: {},
  AreaNameChoice: {},
  Energy: {},
  Lore: {},
  HistoricalRecords: {},
  NPC: {},
  Act: {},
  Era: {},
  TimeGate: {},
  Energie: {},
  Achievement: {},
  Biome: {},
  BiomeFeature: {},
  SolarSystem: {},
  Planet: {},
}


function saveDb() {
  jetpack.write(path.resolve('./db/airtable.json'), db, { atomic: true })
}

setInterval(function() {
  saveDb()
}, 2 * 60 * 1000)


function pad(n, width, z = '0') {
  const nn = n + ''
  return nn.length >= width ? nn : new Array(width - nn.length + 1).join(z) + nn
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
  
  item.uuid = record.id
  item.id = record.get('id')
  item.name = record.get('name')
  item.link = record.get('link')
  item.icon = record.get('image')?.[0]?.url || `/images/items/${pad(item.id, 5)}.png`
  item.image = record.get('image')?.[0]?.url
  item.imageHigh = record.get('imageHigh')?.[0]?.url
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
  item.isSkinnable = !!record.get('isSkinnable')
  item.createdDate = record.get('createdDate') || 0
  item.hotness = record.get('hotness') || 0
  item.numPerfectionRolls = record.get('numPerfectionRolls')
  item.lore1 = record.get('lore1')
  item.lore2 = record.get('lore2')
  item.lore3 = record.get('lore3')
  item.lore4 = record.get('lore4')
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
    uuid: key,
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
    uuid: key,
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
    uuid: key,
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
    uuid: key,
    id: record.get('id'),
    name: record.get('name')
  }

  return app.airtable.cache.getItemSpecificType[key]
}

async function getItemParam(app, key) {
  console.log(9999, key)
  if (!app.airtable.cache.getItemParam) app.airtable.cache.getItemParam = {}
  if (app.airtable.cache.getItemParam[key]) return app.airtable.cache.getItemParam[key]

  const record = await app.airtable.database('ItemParam').find(key)

  app.airtable.cache.getItemParam[key] = {
    uuid: key,
    name: record.get('name'),
  }

  return app.airtable.cache.getItemParam[key]
}

async function getItemAttribute(app, key) {
  if (!app.airtable.cache.getItemAttribute) app.airtable.cache.getItemAttribute = {}

  if (app.airtable.cache.getItemAttribute[key]) return app.airtable.cache.getItemAttribute[key]

  const record = await app.airtable.database('ItemAttribute').find(key)

  const attribute: any = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    displayName: record.get('displayName'),
    listOrder: record.get('listOrder'),
    isEnabled: !!record.get('isEnabled'),
    game: record.get('game') ? (await app.airtable.database('Game').find(record.get('game'))).get('id') : undefined,
    link: record.get('link'),
    isImplemented: !!record.get('isImplemented'),
    paramTypes: record.get('paramTypes'),
    paramValues: record.get('paramValues'),
    nature: record.get('nature'),
    influences: record.get('influences'),
    description: record.get('description') || '',
    explanation: record.get('explanation') || '',
  }

  if (attribute.paramTypes) {
    if (attribute.paramTypes[0] && attribute.paramValues?.[0]) {
      const isPercent = attribute.paramValues[0].indexOf('%') !== -1
      const spec = attribute.paramValues[0].replace('%', '')
      attribute.param1 = {
        spec,
        isPercent,
        min: spec.split('-')[0],
        max: spec.split('-')[1]
      }
    }
  
    if (attribute.paramTypes[1] && attribute.paramValues?.[1]) {
      const isPercent = attribute.paramValues[1].indexOf('%') !== -1
      const spec = attribute.paramValues[1].replace('%', '')
      attribute.param2 = {
        spec,
        isPercent,
        min: spec.split('-')[0],
        max: spec.split('-')[1]
      }
    }
  
    if (attribute.paramTypes[2] && attribute.paramValues?.[2]) {
      const isPercent = attribute.paramValues[2].indexOf('%') !== -1
      const spec = attribute.paramValues[2].replace('%', '')
      attribute.param3 = {
        spec,
        isPercent,
        min: spec.split('-')[0],
        max: spec.split('-')[1]
      }
    }
  }

  app.airtable.cache.getItemAttribute[key] = attribute

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

  recipe.uuid = record.id
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
    uuid: res.id,
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

    await app.airtable.database('Item').select({
      maxRecords: 1000,
      view: "All Data"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched items', records)

      for (const record of records) {
        try {
          if (!record.get('name') || !record.get('isEnabled')) continue // if (!record.get('isPublished')) continue
          
          const item = await getItem(app, record.id)

          console.log(item)

          items.push(item)

          db.Item[record.id] = item
          // if (item.id > 50) break // temp
        } catch(e) {
          console.log('Error', e)
        }
      }

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    })

    app.db.saveItems(items)
  } catch(e) {
    log('Error', e)
  }
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

        skill.uuid = record.id
        skill.name = record.get('name')
        skill.id = record.get('id')
        skill.description = record.get('description') || ''
        skill.shortDescription = record.get('shortDescription') || ''
        skill.games = (await Promise.all((record.get('games') || []).map((key) => db.Game[key] || app.airtable.database('Game').find(key)))).map(item => item.get ? item.get('id') : item.id)
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

        db.Skill[record.id] = skill
      }

      app.db.saveSkills(skills)
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    // fetchNextPage()
  } catch(e) {
    log('Error', e)
  }
}

function processItemAttributes(record, specs) {
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
      itemtype: (key) => ItemTypeIdByName[key],
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
      itemtype: (key) => ItemTypeNames[key],
      classid: (key) => ClassNames[key],
    }
    const maps = {
      3: RuneNames,
      21: ClassNames,
      39: SkillNames,
      40: ItemRarityNameById
    }

    if (spec.params[0]) {
      const param = {} as any

      param.spec = spec.params[0].name

      if (param.spec.indexOf('%') !== -1) {
        param.spec = param.spec.replace(/%/gi, '')
        param.isPercent = true
      }

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

    if (spec.params[1]) {
      const param = {} as any

      param.spec = spec.params[1].name

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

    const isBuff = !!attribute.nature?.includes('Buff') || !!attribute.nature?.includes('Mechanic')
    const isDebuff = !!attribute.nature?.includes('Debuff')

    attributes.push(attribute)
    perfection.push(attribute.param1?.min === attribute.param1?.max ? undefined : (isBuff && !record.get('isRandomRunePerfectionOmit') ? attribute.param1?.max : (isDebuff ? attribute.param1?.min : undefined)))
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

  branches[Games.Raid.id] = processItemAttributes(record, [
    { attr: (await Promise.all((record.get('a1Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a1RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a2Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a2RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a3Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a3RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a4Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a4RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a5Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a5RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a6Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a6RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a7Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a7RaidParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a8Raid') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a8RaidParams') || []).map((key) => getItemParam(app, key)))},
  ])

  branches[Games.Evolution.id] = processItemAttributes(record, [
    { attr: (await Promise.all((record.get('a1Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a1EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a2Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a2EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a3Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a3EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a4Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a4EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a5Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a5EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a6Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a6EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a7Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a7EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a8Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a8EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a9Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a9EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a10Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a10EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a11Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a11EvolutionParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a12Evolution') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a12EvolutionParams') || []).map((key) => getItemParam(app, key)))},
  ])

  branches[Games.Infinite.id] = processItemAttributes(record, [
    { attr: (await Promise.all((record.get('a1Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a1InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a2Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a2InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a3Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a3InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a4Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a4InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a5Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a5InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a6Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a6InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a7Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a7InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a8Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a8InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a9Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a9InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a10Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a10InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a11Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a11InfiniteParams') || []).map((key) => getItemParam(app, key)))},
    { attr: (await Promise.all((record.get('a12Infinite') || []).map((key) => getItemAttribute(app, key))))[0], params: await Promise.all((record.get('a12InfiniteParams') || []).map((key) => getItemParam(app, key)))},
  ])

  return branches
}

async function getItemRecipes(app) {
  log('Fetching airtable data: ItemRecipe')

  const recipeCache = {}
  const itemCache = {}
  const skillCache = {}
  const materialCache = {}

  try {
    const recipes = []

    await app.airtable.database('ItemRecipe').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      log('Fetched recipes', records)

      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue
        // if (!record.get('isPublished')) continue

        const recipe = await getItemRecipe(app, record.id)
  
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

        db.ItemRecipe[record.id] = recipe

        log('Fetched recipe', recipe)
      }

      app.db.saveItemRecipes(recipes)

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}


async function getItemAttributes(app) {
  log('Fetching airtable data: ItemAttribute')

  try {
    const attributes = []

    await app.airtable.database('ItemAttribute').select({
      maxRecords: 20000,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      log('Fetched attributes', records)

      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const attribute = await getItemAttribute(app, record.id)

        attributes.push(attribute)

        db.ItemAttribute[record.id] = attribute

        log('Fetched attribute', attribute)
      }

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    })

    app.db.saveItemAttributes(attributes)
  } catch(e) {
    log('Error', e)
  }
}

async function getSolarSystem(app, key) {
  if (!app.airtable.cache.getSolarSystem) app.airtable.cache.getSolarSystem = {}

  if (app.airtable.cache.getSolarSystem[key]) return app.airtable.cache.getSolarSystem[key]

  const record = await app.airtable.database('SolarSystem').find(key)

  app.airtable.cache.getSolarSystem[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    stars: record.get('stars'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    planets: (await Promise.all((record.get('planets') || []).map((key) => db.AreaType[key] || app.airtable.database('AreaType').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getSolarSystem[key]
}

async function getSolarSystems(app) {
  log('Fetching airtable data: SolarSystem')

  try {
    const items = []

    await app.airtable.database('SolarSystem').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getSolarSystem(app, record.id)

        items.push(item)

        db.SolarSystem[record.id] = item

        log('Fetched', item)
      }

      app.db.saveSolarSystems(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}

async function getPlanet(app, key) {
  if (!app.airtable.cache.getPlanet) app.airtable.cache.getPlanet = {}

  if (app.airtable.cache.getPlanet[key]) return app.airtable.cache.getPlanet[key]

  const record = await app.airtable.database('Planet').find(key)

  app.airtable.cache.getPlanet[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    planet: record.get('planet') ? (await app.airtable.database('Planet').find(record.get('planet'))).get('id') : undefined,
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
  }

  return app.airtable.cache.getPlanet[key]
}

async function getPlanets(app) {
  log('Fetching airtable data: Planet')

  try {
    const items = []

    await app.airtable.database('Planet').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getPlanet(app, record.id)

        items.push(item)

        db.Planet[record.id] = item

        log('Fetched', item)
      }

      app.db.savePlanets(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}


async function getBiome(app, key) {
  if (!app.airtable.cache.getBiome) app.airtable.cache.getBiome = {}

  if (app.airtable.cache.getBiome[key]) return app.airtable.cache.getBiome[key]

  const record = await app.airtable.database('Biome').find(key)

  app.airtable.cache.getBiome[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    features: (await Promise.all((record.get('features') || []).map((key) => db.BiomeFeature[key] || app.airtable.database('BiomeFeature').find(key)))).map(item => item.get ? item.get('id') : item.id),
    areas: (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getBiome[key]
}

async function getBiomes(app) {
  log('Fetching airtable data: Biome')

  try {
    const items = []

    await app.airtable.database('Biome').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = await getBiome(app, record.id)

        items.push(item)

        db.Biome[record.id] = item

        log('Fetched', item)
      }

      app.db.saveBiomes(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}


async function getBiomeFeature(app, key) {
  if (!app.airtable.cache.getBiomeFeature) app.airtable.cache.getBiomeFeature = {}

  if (app.airtable.cache.getBiomeFeature[key]) return app.airtable.cache.getBiomeFeature[key]

  const record = await app.airtable.database('BiomeFeature').find(key)

  app.airtable.cache.getBiomeFeature[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    images: record.get('image')?.map(i => i.url) || [],
    biomes: (await Promise.all((record.get('biomes') || []).map((key) => db.Biome[key] || app.airtable.database('Biome').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getBiomeFeature[key]
}

async function getBiomeFeatures(app) {
  log('Fetching airtable data: BiomeFeature')

  try {
    const items = []

    await app.airtable.database('BiomeFeature').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = await getBiomeFeature(app, record.id)

        items.push(item)

        db.BiomeFeature[record.id] = item

        log('Fetched', item)
      }

      app.db.saveBiomeFeatures(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}

async function getArea(app, key) {
  if (!app.airtable.cache.getArea) app.airtable.cache.getArea = {}

  if (app.airtable.cache.getArea[key]) return app.airtable.cache.getArea[key]

  const record = await app.airtable.database('Area').find(key)

  app.airtable.cache.getArea[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    game: record.get('game') ? (await app.airtable.database('Game').find(record.get('game'))).get('id') : undefined,
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    secondaryImage: record.get('secondaryImage')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    types: (await Promise.all((record.get('types') || []).map((key) => db.AreaType[key] || app.airtable.database('AreaType').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    npcs: (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    guilds: (await Promise.all((record.get('guilds') || []).map((key) => db.CharacterGuild[key] || app.airtable.database('CharacterGuild').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    factions: (await Promise.all((record.get('factions') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    characters: (await Promise.all((record.get('characters') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    characterTypes: (await Promise.all((record.get('characterTypes') || []).map((key) => db.CharacterType[key] || app.airtable.database('CharacterType').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    timeGates: (await Promise.all((record.get('timeGates') || []).map((key) => db.TimeGate[key] || app.airtable.database('TimeGate').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    itemMaterials: (await Promise.all((record.get('itemMaterials') || []).map((key) => db.ItemMaterial[key] || app.airtable.database('ItemMaterial').find(key)))).map(item => item.get ? item.get('id') : item?.id),
    biomes: (await Promise.all((record.get('biomes') || []).map((key) => db.Biome[key] || app.airtable.database('Biome').find(key)))).map(item => item.get ? item.get('id') : item?.id),
  }

  return app.airtable.cache.getArea[key]
}

async function getAreas(app) {
  log('Fetching airtable data: Area')

  try {
    const items = []

    await app.airtable.database('Area').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getArea(app, record.id)

        items.push(item)

        db.Area[record.id] = item

        log('Fetched', item)
      }

      app.db.saveAreas(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}

async function getAreaType(app, key) {
  if (!app.airtable.cache.getAreaType) app.airtable.cache.getAreaType = {}

  if (app.airtable.cache.getAreaType[key]) return app.airtable.cache.getAreaType[key]

  const record = await app.airtable.database('AreaType').find(key)

  app.airtable.cache.getAreaType[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
  }

  return app.airtable.cache.getAreaType[key]
}

async function getAreaTypes(app) {
  log('Fetching airtable data: AreaType')

  try {
    const items = []

    await app.airtable.database('AreaType').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = await getAreaType(app, record.id)

        items.push(item)

        db.AreaType[record.id] = item

        log('Fetched', item)
      }

      app.db.saveAreaTypes(items)

      fetchNextPage()
    })
    
    
    
    
  } catch(e) {
    log('Error', e)
  }
}

async function getAreaNameChoice(app, key) {
  if (!app.airtable.cache.getAreaNameChoice) app.airtable.cache.getAreaNameChoice = {}

  if (app.airtable.cache.getAreaNameChoice[key]) return app.airtable.cache.getAreaNameChoice[key]

  const record = await app.airtable.database('AreaNameChoice').find(key)

  app.airtable.cache.getAreaNameChoice[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isFirst: record.get('isFirst'),
    isLast: record.get('isLast'),
    weight: record.get('weight'),
    characterTypes:  (await Promise.all((record.get('characterTypes') || []).map((key) => db.CharacterType[key] || app.airtable.database('CharacterType').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getAreaNameChoice[key]
}

async function getAreaNameChoices(app) {
  log('Fetching airtable data: AreaNameChoice')

  try {
    const items = []

    await app.airtable.database('AreaNameChoice').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = await getAreaNameChoice(app, record.id)

        items.push(item)

        db.AreaNameChoice[record.id] = item

        log('Fetched', item)
      }

      app.db.saveAreaNameChoices(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterFaction(app, key) {
  if (!app.airtable.cache.getCharacterFaction) app.airtable.cache.getCharacterFaction = {}

  if (app.airtable.cache.getCharacterFaction[key]) return app.airtable.cache.getCharacterFaction[key]

  const record = await app.airtable.database('CharacterFaction').find(key)

  app.airtable.cache.getCharacterFaction[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    npcs: (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id),
    areas: (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id),
    activeFactionConflict: (await Promise.all((record.get('activeFactionConflict') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item.id),
    passiveFactionConflict: (await Promise.all((record.get('passiveFactionConflict') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item.id),
    activeGuildConflict: (await Promise.all((record.get('activeGuildConflict') || []).map((key) => db.CharacterGuild[key] || app.airtable.database('CharacterGuild').find(key)))).map(item => item.get ? item.get('id') : item.id),
    areaConflict: (await Promise.all((record.get('areaConflict') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id),
    characters: (await Promise.all((record.get('characters') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getCharacterFaction[key]
}

async function getCharacterFactions(app) {
  log('Fetching airtable data: CharacterFaction')

  try {
    const items = []

    await app.airtable.database('CharacterFaction').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getCharacterFaction(app, record.id)

        items.push(item)

        db.CharacterFaction[record.id] = item

        log('Fetched', item)
      }

      app.db.saveCharacterFactions(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}


async function getCharacterGuild(app, key) {
  if (!app.airtable.cache.getCharacterGuild) app.airtable.cache.getCharacterGuild = {}

  if (app.airtable.cache.getCharacterGuild[key]) return app.airtable.cache.getCharacterGuild[key]
console.log(key)
  const record = await app.airtable.database('CharacterGuild').find(key)

  app.airtable.cache.getCharacterGuild[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    types: record.get('types'),
    classRequired: (await Promise.all((record.get('classRequired') || []).map((key) => db.CharacterClass[key] || app.airtable.database('CharacterClass').find(key)))).map(item => item.get ? item.get('id') : item.id),
    npcs: (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id),
    passiveFactionConflict: (await Promise.all((record.get('passiveFactionConflict') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item.id),
    activeFactionConflict: (await Promise.all((record.get('activeFactionConflict') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item.id),
    passiveGuildConflict: (await Promise.all((record.get('passiveGuildConflict') || []).map((key) => db.CharacterGuild[key] || app.airtable.database('CharacterGuild').find(key)))).map(item => item.get ? item.get('id') : item.id),
    activeGuildConflict: (await Promise.all((record.get('activeGuildConflict') || []).map((key) => db.CharacterGuild[key] || app.airtable.database('CharacterGuild').find(key)))).map(item => item.get ? item.get('id') : item.id),
    areas: (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getCharacterGuild[key]
}

async function getCharacterGuilds(app) {
  log('Fetching airtable data: CharacterGuild')

  try {
    const items = []

    await app.airtable.database('CharacterGuild').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getCharacterGuild(app, record.id)

        items.push(item)

        db.CharacterGuild[record.id] = item

        log('Fetched', item)
      }

      app.db.saveCharacterGuilds(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterType(app, key) {
  if (!app.airtable.cache.getCharacterType) app.airtable.cache.getCharacterType = {}

  if (app.airtable.cache.getCharacterType[key]) return app.airtable.cache.getCharacterType[key]

  const record = await app.airtable.database('CharacterType').find(key)

  app.airtable.cache.getCharacterType[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    npcs: (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id),
    races: (await Promise.all((record.get('characterRaces') || []).map((key) => db.CharacterRace[key] || app.airtable.database('CharacterRace').find(key)))).map(item => item.get ? item.get('id') : item.id),
    areas: (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id),
    characters: (await Promise.all((record.get('characters') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getCharacterType[key]
}

async function getCharacterTypes(app) {
  log('Fetching airtable data: CharacterType')

  try {
    const items = []

    await app.airtable.database('CharacterType').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getCharacterType(app, record.id)

        items.push(item)

        db.CharacterType[record.id] = item

        log('Fetched', item)
      }

      app.db.saveCharacterTypes(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}


async function getNpc(app, key) {
  if (!app.airtable.cache.getNpc) app.airtable.cache.getNpc = {}

  if (app.airtable.cache.getNpc[key]) return app.airtable.cache.getNpc[key]

  const record = await app.airtable.database('NPC').find(key)

  app.airtable.cache.getNpc[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    title: record.get('title'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    secondaryImage: record.get('secondaryImage')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    quote1: record.get('quote1'),
    character: record.get('character') ? (await app.airtable.database('Character').find(record.get('character'))).get('id') : undefined,
    characterRace: record.get('characterRace') ? (await app.airtable.database('CharacterRace').find(record.get('characterRace'))).get('id') : undefined,
    characterClass: record.get('characterClass') ? (await app.airtable.database('CharacterClass').find(record.get('characterClass'))).get('id') : undefined,
    characterGuild: record.get('characterGuild') ? (await app.airtable.database('CharacterGuild').find(record.get('characterGuild'))).get('id') : undefined,
    characterTypes: (await Promise.all((record.get('characterTypes') || []).map((key) => db.CharacterType[key] || app.airtable.database('CharacterType').find(key)))).map(item => item.get ? item.get('id') : item.id),
    energies: (await Promise.all((record.get('energies') || []).map((key) => db.Energy[key] || app.airtable.database('Energy').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getNpc[key]
}

async function getNpcs(app) {
  log('Fetching airtable data: NPC')

  try {
    const items = []

    await app.airtable.database('NPC').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getNpc(app, record.id)

        items.push(item)

        db.NPC[record.id] = item

        log('Fetched', item)
      }

      app.db.saveNpcs(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getAct(app, key) {
  if (!app.airtable.cache.getAct) app.airtable.cache.getAct = {}

  if (app.airtable.cache.getAct[key]) return app.airtable.cache.getAct[key]

  const record = await app.airtable.database('Act').find(key)

  app.airtable.cache.getAct[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    secondaryImage: record.get('secondaryImage')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    townNpcs: (await Promise.all((record.get('townNpcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item?.id),
  }

  return app.airtable.cache.getAct[key]
}

async function getActs(app) {
  log('Fetching airtable data: Act')

  try {
    const items = []

    await app.airtable.database('Act').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getAct(app, record.id)

        items.push(item)

        db.Act[record.id] = item

        log('Fetched', item)
      }

      app.db.saveActs(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getEra(app, key) {
  if (!app.airtable.cache.getEra) app.airtable.cache.getEra = {}

  if (app.airtable.cache.getEra[key]) return app.airtable.cache.getEra[key]

  const record = await app.airtable.database('Era').find(key)

  app.airtable.cache.getEra[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    secondaryImage: record.get('secondaryImage')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
  }

  return app.airtable.cache.getEra[key]
}

async function getEras(app) {
  log('Fetching airtable data: Era')

  try {
    const items = []

    await app.airtable.database('Era').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getEra(app, record.id)

        items.push(item)

        db.Era[record.id] = item

        log('Fetched', item)
      }

      app.db.saveEras(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getTimeGate(app, key) {
  if (!app.airtable.cache.getTimeGate) app.airtable.cache.getTimeGate = {}

  if (app.airtable.cache.getTimeGate[key]) return app.airtable.cache.getTimeGate[key]

  const record = await app.airtable.database('TimeGate').find(key)

  app.airtable.cache.getTimeGate[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    area: record.get('area') ? (await app.airtable.database('Area').find(record.get('area'))).get('id') : undefined,
  }

  return app.airtable.cache.getTimeGate[key]
}

async function getTimeGates(app) {
  log('Fetching airtable data: TimeGate')

  try {
    const items = []

    await app.airtable.database('TimeGate').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getTimeGate(app, record.id)

        items.push(item)

        db.TimeGate[record.id] = item

        log('Fetched', item)
      }

      app.db.saveTimeGates(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getAchievement(app, key) {
  if (!app.airtable.cache.getAchievement) app.airtable.cache.getAchievement = {}

  if (app.airtable.cache.getAchievement[key]) return app.airtable.cache.getAchievement[key]

  const record = await app.airtable.database('Achievement').find(key)

  app.airtable.cache.getAchievement[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    link: record.get('link'),
    game: record.get('game') ? (await app.airtable.database('Game').find(record.get('game'))).get('id') : undefined,
    image: record.get('image')?.[0]?.url,
    key: record.get('key') || '',
    category: record.get('category'),
    type: record.get('type'),
    date: record.get('date'),
    description: record.get('description') || '',
  }

  return app.airtable.cache.getAchievement[key]
}

async function getAchievements(app) {
  log('Fetching airtable data: Achievement')

  try {
    const items = []

    await app.airtable.database('Achievement').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getAchievement(app, record.id)

        items.push(item)

        db.Achievement[record.id] = item

        log('Fetched', item)
      }

      app.db.saveAchievements(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getEnergy(app, key) {
  if (!app.airtable.cache.getEnergy) app.airtable.cache.getEnergy = {}

  if (app.airtable.cache.getEnergy[key]) return app.airtable.cache.getEnergy[key]

  const record = await app.airtable.database('Energy').find(key)

  app.airtable.cache.getEnergy[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    color: record.get('color'),
    users: record.get('users'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    npcs: (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item?.id),
  }

  return app.airtable.cache.getEnergy[key]
}

async function getEnergies(app) {
  log('Fetching airtable data: Energy')

  try {
    const items = []

    await app.airtable.database('Energy').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        const item = await getEnergy(app, record.id)

        items.push(item)

        db.Energy[record.id] = item

        log('Fetched', item)
      }

      app.db.saveEnergies(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

async function getLore(app, key) {
  if (!app.airtable.cache.getLore) app.airtable.cache.getLore = {}

  if (app.airtable.cache.getLore[key]) return app.airtable.cache.getLore[key]

  const record = await app.airtable.database('Lore').find(key)

  app.airtable.cache.getLore[key] = {
    uuid: key,
    id: record.get('id'),
    name: record.get('name'),
    isEnabled: !!record.get('isEnabled'),
    game: record.get('game') ? (await app.airtable.database('Game').find(record.get('game'))).get('id') : undefined,
    link: record.get('link'),
    key: record.get('key'),
    shortDescription: record.get('shortDescription') || '',
    description: record.get('description') || '',
    image: record.get('image')?.[0]?.url,
    secondaryImage: record.get('secondaryImage')?.[0]?.url,
    lore1: record.get('lore1'),
    lore2: record.get('lore2'),
    lore3: record.get('lore3'),
    lore4: record.get('lore4'),
    lore5: record.get('lore5'),
    historicalRecords: (await Promise.all((record.get('historicalRecords') || []).map((key) => db.HistoricalRecords[key] || app.airtable.database('Historical Records').find(key)))).map(item => item.get ? item.get('id') : item.id),
  }

  return app.airtable.cache.getLore[key]
}

async function getLores(app) {
  log('Fetching airtable data: Lore')

  try {
    const items = []

    await app.airtable.database('Lore').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name') || !record.get('isEnabled')) continue

        const item = await getLore(app, record.id)

        items.push(item)

        db.Lore[record.id] = item

        log('Fetched', item)
      }

      app.db.saveLores(items)

      fetchNextPage()
    })
  } catch(e) {
    log('Error', e)
  }
}

function convertToPercent(value) {
  if (value === undefined) return undefined

  return `${value}%`
  // if (value.split('-').length < 2) return `${value}%`
  // if (value.split('-').length > 2) return `${value}%`

  // return `${value.split('-')[0]}-${value.split('-')[1]}%`
}

async function convertItemParams(app) {
  log('Converting airtable data: Item -> params')

  try {
    const items = []

    await app.airtable.database('Item').select({
      maxRecords: 10000,
      view: "All Data"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched items', records)

      for (const record of records) {
        try {
          // if (!record.get('isPublished')) continue
          console.log(record.get('name'))

          const convertParam = async (game, num) => {
            const result = []

            for (let i = 1; i <= 3; i++) {
              const paramValue = record.get(`a${num}Param${i}${game}`)

              if (paramValue && record.get(`a${num}${game}`)) {
                const attr = await app.airtable.database('ItemAttribute').find(record.get(`a${num}${game}`))
  console.log(game, num, i, attr.get(`paramType${i}`))
                if (attr.get(`paramType${i}`) === 'percent') {
                  result.push(convertToPercent(paramValue))
                } else {
                  result.push(paramValue)
                }
              }
            }

            return result
          }

          const data = {
            'a1RaidParams': [...(await convertParam('Raid', 1))].filter(r => !!r),
            'a2RaidParams': [...(await convertParam('Raid', 2))].filter(r => !!r),
            'a3RaidParams': [...(await convertParam('Raid', 3))].filter(r => !!r),
            'a4RaidParams': [...(await convertParam('Raid', 4))].filter(r => !!r),
            'a5RaidParams': [...(await convertParam('Raid', 5))].filter(r => !!r),
            'a6RaidParams': [...(await convertParam('Raid', 6))].filter(r => !!r),
            'a7RaidParams': [...(await convertParam('Raid', 7))].filter(r => !!r),
            'a8RaidParams': [...(await convertParam('Raid', 8))].filter(r => !!r),
            'a1EvolutionParams': [...(await convertParam('Evolution', 1))].filter(r => !!r),
            'a2EvolutionParams': [...(await convertParam('Evolution', 2))].filter(r => !!r),
            'a3EvolutionParams': [...(await convertParam('Evolution', 3))].filter(r => !!r),
            'a4EvolutionParams': [...(await convertParam('Evolution', 4))].filter(r => !!r),
            'a5EvolutionParams': [...(await convertParam('Evolution', 5))].filter(r => !!r),
            'a6EvolutionParams': [...(await convertParam('Evolution', 6))].filter(r => !!r),
            'a7EvolutionParams': [...(await convertParam('Evolution', 7))].filter(r => !!r),
            'a8EvolutionParams': [...(await convertParam('Evolution', 8))].filter(r => !!r),
            'a9EvolutionParams': [...(await convertParam('Evolution', 9))].filter(r => !!r),
            'a10EvolutionParams': [...(await convertParam('Evolution', 10))].filter(r => !!r),
            'a11EvolutionParams': [...(await convertParam('Evolution', 11))].filter(r => !!r),
            'a12EvolutionParams': [...(await convertParam('Evolution', 12))].filter(r => !!r),
            'a1InfiniteParams': [...(await convertParam('Infinite', 1))].filter(r => !!r),
            'a2InfiniteParams': [...(await convertParam('Infinite', 2))].filter(r => !!r),
            'a3InfiniteParams': [...(await convertParam('Infinite', 3))].filter(r => !!r),
            'a4InfiniteParams': [...(await convertParam('Infinite', 4))].filter(r => !!r),
            'a5InfiniteParams': [...(await convertParam('Infinite', 5))].filter(r => !!r),
            'a6InfiniteParams': [...(await convertParam('Infinite', 6))].filter(r => !!r),
            'a7InfiniteParams': [...(await convertParam('Infinite', 7))].filter(r => !!r),
            'a8InfiniteParams': [...(await convertParam('Infinite', 8))].filter(r => !!r),
            'a9InfiniteParams': [...(await convertParam('Infinite', 9))].filter(r => !!r),
            'a10InfiniteParams': [...(await convertParam('Infinite', 10))].filter(r => !!r),
            'a11InfiniteParams': [...(await convertParam('Infinite', 11))].filter(r => !!r),
            'a12InfiniteParams': [...(await convertParam('Infinite', 12))].filter(r => !!r),
          }

          // console.log(data)
          
          app.airtable.database('Item').update(
              record.id,
              data,
              {typecast: true}
          )
          .then(function(rec) {
            // console.log(rec)
            console.log('Done')
          })
          // record.putUpdate({'a1RaidParams': [record.get('a1Param1Raid'), record.get('a1Param2Raid')].filter(r => !!r)})

          // return
        } catch(e) {
          console.log('Error', e)
          return
        }
      }

      fetchNextPage()
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    // fetchNextPage()
  } catch(e) {
    log('Error', e)
  }
}


async function convertItemAttributes(app) {
  log('Converting airtable data: ItemAttribute -> params')

  try {
    const items = []

    await app.airtable.database('ItemAttribute').select({
      maxRecords: 10000,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      // log('Fetched items', records)

      for (const record of records) {
        try {
          // if (!record.get('isPublished')) continue
          console.log(record.get('name'))

          const data = {
            'paramValues': [record.get('paramType1') === 'percent' ? convertToPercent(record.get('paramValue1')) : record.get('paramValue1'), record.get('paramType2') === 'percent' ? convertToPercent(record.get('paramValue2')) : record.get('paramValue2'), record.get('paramType3') === 'percent' ? convertToPercent(record.get('paramValue3')) : record.get('paramValue3')].filter(r => !!r),
            'paramTypes': [record.get('paramType1')?.replace('percent', 'value'), record.get('paramType2')?.replace('percent', 'value'), record.get('paramType3')?.replace('percent', 'value')].filter(r => !!r),
          }

          console.log(data)
          
          app.airtable.database('ItemAttribute').update(
              record.id,
              data,
              {typecast: true}
          )
          .then(function(rec) {
            // console.log(rec)
            console.log('Done')
          })
          // record.putUpdate({'a1RaidParams': [record.get('a1Param1Raid'), record.get('a1Param2Raid')].filter(r => !!r)})

          // return
        } catch(e) {
          console.log('Error', e)
          return
        }
      }

      fetchNextPage()
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    // fetchNextPage()
  } catch(e) {
    log('Error', e)
  }
}

async function getGames(app) {
  log('Fetching airtable data: Game')

  try {
    const items = []

    await app.airtable.database('Game').select({
      maxRecords: 10,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        // if (!record.get('isPublished')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.primaryColor = record.get('primaryColor')
        item.secondaryColor = record.get('secondaryColor')
        item.logoLink = record.get('logoLink')
        item.shortDescription = record.get('shortDescription') || ''
        item.description = record.get('description') || ''
        item.storyline = record.get('storyline') || ''
        item.cmcDescription = record.get('cmcDescription') || ''
        item.contracts = record.get('contracts')
  
        items.push(item)

        db.Game[record.id] = item

        log('Fetched item', item)
      }

      fetchNextPage()
    })

    app.db.saveGames(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getGameInfos(app) {
  log('Fetching airtable data: GameInfo')

  try {
    const items = []

    await app.airtable.database('GameInfo').select({
      maxRecords: 200,
      view: "All"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.text = record.get('text')
        item.game = (await app.airtable.database('Game').find(record.get('game'))).get('id')
        item.isEnabled = !!record.get('isEnabled')
        item.attachments = record.get('attachments')?.map(i => i.url) || []
  
        items.push(item)

        db.GameInfo[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveGameInfos(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemMaterials(app) {
  log('Fetching airtable data: ItemMaterial')

  try {
    const items = []

    await app.airtable.database('ItemMaterial').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      log('Fetching', records)
      for (const record of records) {
        const item = {} as any

        if (!record.get('isEnabled')) continue

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.types = record.get('types')
        item.description = record.get('description') || ''
        item.basicItem = record.get('basicItem') ? (await app.airtable.database('Item').find(record.get('basicItem'))).get('id') : undefined
        item.rarity = record.get('rarity') ? (await app.airtable.database('ItemRarity').find(record.get('rarity'))).get('id') : undefined
        item.droppedBy = (await Promise.all((record.get('droppedBy') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.areas = (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.recipes = (await Promise.all((record.get('recipes') || []).map((key) => db.ItemRecipe[key] || app.airtable.database('ItemRecipe').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemMaterial[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemMaterials(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemAttributeParams(app) {
  log('Fetching airtable data: ItemAttributeParam')

  try {
    const items = []

    await app.airtable.database('ItemAttributeParam').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.values = record.get('values')
  
        items.push(item)

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemAttributeParams(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemParams(app) {
  log('Fetching airtable data: ItemParam')

  try {
    const items = []

    await app.airtable.database('ItemParam').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        const item = {} as any

        item.name = record.get('name')
  
        items.push(item)

        db.ItemParam[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemParams(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemSpecificTypes(app) {
  log('Fetching airtable data: ItemSpecificType')

  try {
    const items = []

    await app.airtable.database('ItemSpecificType').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.subType = record.get('subType') ? (await app.airtable.database('ItemSubType').find(record.get('subType'))).get('id') : undefined
        item.items = (await Promise.all((record.get('items') || []).map((key) => db.Item[key] || app.airtable.database('Item').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.itemMaterials = (await Promise.all((record.get('itemMaterials') || []).map((key) => db.ItemMaterial[key] || app.airtable.database('ItemMaterial').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemSpecificType[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemSpecificTypes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemSubTypes(app) {
  log('Fetching airtable data: ItemSubType')

  try {
    const items = []

    await app.airtable.database('ItemSubType').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.min = record.get('min')
        item.max = record.get('max')
        item.speed = record.get('speed')
        item.range = record.get('range')
        item.weight = record.get('weight')
        item.type = record.get('type') ? (await app.airtable.database('ItemType').find(record.get('type'))).get('id') : undefined
        item.items = (await Promise.all((record.get('items') || []).map((key) => db.Item[key] || app.airtable.database('Item').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.specificTypes = (await Promise.all((record.get('specificTypes') || []).map((key) => db.ItemSpecificType[key] || app.airtable.database('ItemSpecificType').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemSubType[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemSubTypes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemTypes(app) {
  log('Fetching airtable data: ItemType')

  try {
    const items = []

    await app.airtable.database('ItemType').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.items = (await Promise.all((record.get('items') || []).map((key) => db.Item[key] || app.airtable.database('Item').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.subTypes = (await Promise.all((record.get('subTypes') || []).map((key) => db.ItemSubType[key] || app.airtable.database('ItemSubType').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.recipes = (await Promise.all((record.get('recipes') || []).map((key) => db.ItemRecipe[key] || app.airtable.database('ItemRecipe').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.slots = (await Promise.all((record.get('slots') || []).map((key) => db.ItemSlot[key] || app.airtable.database('ItemSlot').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemType[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemTypes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemAffixes(app) {
  log('Fetching airtable data: ItemAffix')

  try {
    const items = []

    await app.airtable.database('ItemAffix').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.isPrefix = !!record.get('isPrefix')
        item.isSuffix = !!record.get('isSuffix')
        item.isTitle = !!record.get('isTitle')
        item.description = record.get('description') || ''
        item.types = (await Promise.all((record.get('types') || []).map((key) => db.ItemType[key] || app.airtable.database('ItemType').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.rarities = (await Promise.all((record.get('rarities') || []).map((key) => db.ItemRarity[key] || app.airtable.database('ItemRarity').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemAffix[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemAffixes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemSlots(app) {
  log('Fetching airtable data: ItemSlot')

  try {
    const items = []

    await app.airtable.database('ItemSlot').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.types = (await Promise.all((record.get('types') || []).map((key) => db.ItemType[key] || app.airtable.database('ItemType').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemSlot[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemSlots(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemRarities(app) {
  log('Fetching airtable data: ItemRarity')

  try {
    const items = []

    await app.airtable.database('ItemRarity').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.color = record.get('color')
        item.description = record.get('description') || ''
        item.materials = (await Promise.all((record.get('materials') || []).map((key) => db.ItemMaterial[key] || app.airtable.database('ItemMaterial').find(key)))).map(item => item.get ? item.get('id') : item.id)
        // item.affixes = (await Promise.all((record.get('affixes') || []).map((key) => db.ItemAffix[key] || app.airtable.database('ItemAffix').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.ItemRarity[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemRarities(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemSets(app) {
  log('Fetching airtable data: ItemSet')

  try {
    const items = []

    await app.airtable.database('ItemSet').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.key = record.get('key')
        item.description = record.get('description') || ''
        item.levels = record.get('levels')
        item.head = record.get('head') ? (await app.airtable.database('Item').find(record.get('head'))).get('id') : undefined
        item.armor = record.get('armor') ? (await app.airtable.database('Item').find(record.get('armor'))).get('id') : undefined
        item.weapon = record.get('weapon') ? (await app.airtable.database('Item').find(record.get('weapon'))).get('id') : undefined
        item.weapon2 = record.get('weapon2') ? (await app.airtable.database('Item').find(record.get('weapon2'))).get('id') : undefined
        item.ring = record.get('ring') ? (await app.airtable.database('Item').find(record.get('ring'))).get('id') : undefined
        item.boots = record.get('boots') ? (await app.airtable.database('Item').find(record.get('boots'))).get('id') : undefined
        item.gloves = record.get('gloves') ? (await app.airtable.database('Item').find(record.get('gloves'))).get('id') : undefined
        item.leggings = record.get('leggings') ? (await app.airtable.database('Item').find(record.get('leggings'))).get('id') : undefined
        item.necklace = record.get('necklace') ? (await app.airtable.database('Item').find(record.get('necklace'))).get('id') : undefined
        item.belt = record.get('belt') ? (await app.airtable.database('Item').find(record.get('belt'))).get('id') : undefined
  
        items.push(item)

        db.ItemSet[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveItemSets(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getItemTransmuteRules(app) {
  
}

async function getSkillClassifications(app) {
  log('Fetching airtable data: SkillClassification')

  try {
    const items = []

    await app.airtable.database('SkillClassification').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.isEnabled = !!record.get('isEnabled')
        item.code = record.get('code')
        item.tags = record.get('tags')
        item.skills = (await Promise.all((record.get('skills') || []).map((key) => db.Skill[key] || app.airtable.database('Skill').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.characterClasses = (await Promise.all((record.get('characterClasses') || []).map((key) => db.CharacterClass[key] || app.airtable.database('CharacterClass').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.SkillClassification[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillClassifications(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getSkillMods(app) {
  log('Fetching airtable data: SkillMod')

  try {
    const items = []

    await app.airtable.database('SkillMod').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.skills = (await Promise.all((record.get('skills') || []).map((key) => db.Skill[key] || app.airtable.database('Skill').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.SkillMod[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillMods(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getSkillConditions(app) {
  log('Fetching airtable data: SkillCondition')

  try {
    const items = []

    await app.airtable.database('SkillCondition').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.description = record.get('description') || ''
        item.explanation = record.get('explanation') || ''
        item.example = record.get('example') || ''
        item.scope = record.get('scope')
        item.parameters = record.get('parameters')
  
        items.push(item)

        db.SkillCondition[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillConditions(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getSkillConditionParams(app) {
  log('Fetching airtable data: SkillConditionParam')

  try {
    const items = []

    await app.airtable.database('SkillConditionParam').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.examples = record.get('examples')
  
        items.push(item)

        db.SkillConditionParam[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillConditionParams(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getSkillStatusEffects(app) {
  log('Fetching airtable data: SkillStatusEffect')

  try {
    const items = []

    await app.airtable.database('SkillStatusEffect').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.type = record.get('type')
        item.isImplemented = !!record.get('isImplemented')
        item.duration = record.get('duration')
        item.stats = record.get('stats')
        item.explanation = record.get('explanation') || ''
        item.description = record.get('description') || ''
        item.modifiers = record.get('modifiers')
        item.chanceToApply = record.get('chanceToApply')
        item.criticalHitBonus = record.get('criticalHitBonus')
        item.games = (await Promise.all((record.get('games') || []).map((key) => db.Game[key] || app.airtable.database('Game').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.SkillStatusEffect[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillStatusEffects(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getSkillTreeNodes(app) {
  log('Fetching airtable data: SkillTreeNode')

  try {
    const items = []

    await app.airtable.database('SkillTreeNode').select({
      maxRecords: 200,
      view: "All"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.nodeId = record.get('nodeId')
        item.classStartIndex = record.get('classStartIndex')
        item.isSubclassStart = !!record.get('isSubclassStart')
        item.orbit = record.get('orbit')
        item.orbitIndex = record.get('orbitIndex')
        item.in = record.get('in')
        item.out = record.get('out')
        item.requiredNode = record.get('requiredNode')
        item.xPos = record.get('xPos')
        item.yPos = record.get('yPos')
        item.icon = record.get('icon')
        item.games = (await Promise.all((record.get('games') || []).map((key) => db.Game[key] || app.airtable.database('Game').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.subclass = record.get('subclass') ? (await app.airtable.database('CharacterClass').find(record.get('subclass'))).get('id') : undefined
        item.parentClass = record.get('parentClass') ? (await app.airtable.database('CharacterClass').find(record.get('parentClass'))).get('id') : undefined
  
        items.push(item)

        db.SkillTreeNode[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveSkillTreeNodes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getRunes(app) {
  log('Fetching airtable data: Rune')

  try {
    const items = []

    await app.airtable.database('Rune').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
  
        items.push(item)

        db.Rune[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    // app.db.saveRunes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterRaces(app) {
  log('Fetching airtable data: CharacterRace')

  try {
    const items = []

    await app.airtable.database('CharacterRace').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.isPlayable = !!record.get('isPlayable')
        item.image = record.get('image')?.[0]?.url
        item.color = record.get('color')
        item.geography = record.get('geography')
        item.shortDescription = record.get('shortDescription') || ''
        item.description = record.get('description') || ''
        item.npcs = (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.type = record.get('type') ? (await app.airtable.database('CharacterType').find(record.get('type'))).get('id') : undefined
        item.lore1 = record.get('lore1')
        item.lore2 = record.get('lore2')
        item.lore3 = record.get('lore3')
        item.lore4 = record.get('lore4')
  
        items.push(item)

        db.CharacterRace[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterRaces(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterGenders(app) {
  log('Fetching airtable data: CharacterGender')

  try {
    const items = []

    await app.airtable.database('CharacterGender').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.characters = (await Promise.all((record.get('characters') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.npcs = (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.classes = (await Promise.all((record.get('classes') || []).map((key) => db.CharacterClass[key] || app.airtable.database('CharacterClass').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.CharacterGender[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterGenders(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterClasses(app) {
  log('Fetching airtable data: CharacterClass')

  try {
    const items = []

    await app.airtable.database('CharacterClass').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.link = record.get('link')
        item.parent = record.get('parent') ? (await app.airtable.database('CharacterClass').find(record.get('parent'))).get('id') : undefined
        item.characters = (await Promise.all((record.get('characters') || []).map((key) => db.Character[key] || app.airtable.database('Character').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.npcs = (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.skills = (await Promise.all((record.get('skills') || []).map((key) => db.Skill[key] || app.airtable.database('Skill').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.guilds = (await Promise.all((record.get('guilds') || []).map((key) => db.CharacterGuild[key] || app.airtable.database('CharacterGuild').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.shortDescription = record.get('shortDescription') || ''
        item.description = record.get('description') || ''
        item.buildInfo = record.get('buildInfo')
        item.lore1 = record.get('lore1')
        item.lore2 = record.get('lore2')
        item.lore3 = record.get('lore3')
        item.lore4 = record.get('lore4')
        item.images = record.get('images')?.map(i => i.url) || []
        item.raidImage = record.get('raidImage')?.[0]?.url
        item.infiniteImage = record.get('infiniteImage')?.[0]?.url
        item.sanctuaryImage = record.get('sanctuaryImage')?.[0]?.url
        item.maleImage = record.get('maleImage')?.[0]?.url
        item.femaleImage = record.get('femaleImage')?.[0]?.url
        item.gender = record.get('gender')
        item.archetype = record.get('archetype')
        item.role = record.get('role')
        item.isPlayable = !!record.get('isPlayable')
  
        items.push(item)

        db.CharacterClass[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterClasses(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacters(app) {
  log('Fetching airtable data: Character')

  try {
    const items = []

    await app.airtable.database('Character').select({
      maxRecords: 1000,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.types = (await Promise.all((record.get('types') || []).map((key) => db.CharacterType[key] || app.airtable.database('CharacterType').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.areas = (await Promise.all((record.get('areas') || []).map((key) => db.Area[key] || app.airtable.database('Area').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.factions = (await Promise.all((record.get('factions') || []).map((key) => db.CharacterFaction[key] || app.airtable.database('CharacterFaction').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.npcs = (await Promise.all((record.get('npcs') || []).map((key) => db.NPC[key] || app.airtable.database('NPC').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.itemMaterials = (await Promise.all((record.get('itemMaterials') || []).map((key) => db.ItemMaterial[key] || app.airtable.database('ItemMaterial').find(key)))).map(item => item.get ? item.get('id') : item.id)
        item.personality = record.get('personality')
        item.name = record.get('name')
        item.shortDescription = record.get('shortDescription') || ''
        item.description = record.get('description') || ''
  
        items.push(item)

        db.Character[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacters(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterAttributes(app) {
  log('Fetching airtable data: CharacterAttribute')

  try {
    const items = []

    await app.airtable.database('CharacterAttribute').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.isManual = !!record.get('isManual')
        item.value = record.get('value')
        item.description = record.get('description') || ''
  
        items.push(item)

        db.CharacterAttribute[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterAttributes(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterStats(app) {
  log('Fetching airtable data: CharacterStat')

  try {
    const items = []

    await app.airtable.database('CharacterStat').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.key = record.get('key')
        item.params = record.get('params')
        item.games = (await Promise.all((record.get('games') || []).map((key) => db.Game[key] || app.airtable.database('Game').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.CharacterStat[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterStats(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterTitles(app) {
  log('Fetching airtable data: CharacterTitle')

  try {
    const items = []

    await app.airtable.database('CharacterTitle').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
  
        items.push(item)

        db.CharacterTitle[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterTitles(items)
  } catch(e) {
    log('Error', e)
  }
}

async function getCharacterNameChoices(app) {
  log('Fetching airtable data: CharacterNameChoice')

  try {
    const items = []

    await app.airtable.database('CharacterNameChoice').select({
      maxRecords: 200,
      view: "Grid view"
    }).eachPage(async function page(records, fetchNextPage) {
      for (const record of records) {
        if (!record.get('name')) continue

        const item = {} as any

        item.uuid = record.id
        item.id = record.get('id')
        item.name = record.get('name')
        item.isFirst = !!record.get('isFirst')
        item.isLast = !!record.get('isLast')
        item.isFull = !!record.get('isFull')
        item.isTitle = !!record.get('isTitle')
        item.isLight = !!record.get('isLight')
        item.isPet = !!record.get('isPet')
        item.gender = record.get('gender')
        item.weight = record.get('weight')
        item.types = (await Promise.all((record.get('types') || []).map((key) => db.CharacterType[key] || app.airtable.database('CharacterType').find(key)))).map(item => item.get ? item.get('id') : item.id)
  
        items.push(item)

        db.CharacterNameChoice[record.id] = item

        log('Fetched', item)
      }

      fetchNextPage()
    })
    
    app.db.saveCharacterNameChoices(items)
  } catch(e) {
    log('Error', e)
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

    // await getGames(app)
    // await getGameInfos(app)
    // await getRunes(app)
    // await getSkills(app)
    await getItems(app)
    // await getItemRecipes(app)
    // await getItemAttributes(app)
    // await getItemMaterials(app)
    // await getItemAttributeParams(app)
    // await getItemParams(app)
    // await getItemSpecificTypes(app)
    // await getItemSubTypes(app)
    // await getItemTypes(app)
    // await getItemAffixes(app)
    // await getItemSlots(app)
    // await getItemRarities(app)
    // await getItemSets(app)
    // await getItemTransmuteRules(app)
    // await getSkillClassifications(app)
    // await getSkillMods(app)
    // await getSkillConditions(app)
    // await getSkillConditionParams(app)
    // await getSkillStatusEffects(app)
    // await getSkillTreeNodes(app)
    // await getAreas(app)
    // await getAreaNameChoices(app)
    // await getCharacters(app)
    // await getCharacterTypes(app)
    // await getCharacterAttributes(app)
    // await getCharacterStats(app)
    // await getCharacterTitles(app)
    // await getCharacterGuilds(app)
    // await getCharacterRaces(app)
    // await getCharacterGenders(app)
    // await getCharacterFactions(app)
    // await getCharacterClasses(app)
    // // await getCharacterSpawnRules(app)
    // // await getCharacterFightingStyles(app)
    // await getCharacterNameChoices(app)
    // // await getCharacterMovementStasuses(app)
    // // await getCharacterPersonalities(app)
    // await getLores(app)
    // await getNpcs(app)
    // await getActs(app)
    // await getEras(app)
    // await getTimeGates(app)
    // await getEnergies(app)
    // await getAchievements(app)
    // await getBiomes(app)
    // await getBiomeFeatures(app)
    // await getSolarSystems(app)
    // await getPlanets(app)
  } catch(e) {
    log('Error', e)
  }
}