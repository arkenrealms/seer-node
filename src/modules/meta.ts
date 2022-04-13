import path from 'path'
import * as ethers from 'ethers'
import jetpack from 'fs-jetpack'
import beautify from 'json-beautify'
import { achievementData } from '@rune-backend-sdk/data/achievements'
import { ItemsMainCategoriesType } from '@rune-backend-sdk/data/items.type'
import { itemData, ItemTypeToText, ItemSlotToText, RuneNames, ItemAttributesById, ItemAttributes, SkillNames, ClassNames, ItemRarity } from '@rune-backend-sdk/data/items'

export async function monitorMeta(app) {
  try {
    console.log('Saving achievement data')
    jetpack.write(path.resolve('./db/achievements.json'), beautify(achievementData, null, 2), { atomic: true })
  
    // console.log('Saving item data')
    // jetpack.write(path.resolve('./db/items.json'), beautify(itemData, null, 2), { atomic: true })
  
    console.log('Saving item attribute data')
    jetpack.write(path.resolve('./db/itemAttributes.json'), beautify(ItemAttributes, null, 2), { atomic: true })
  
    // console.log('Saving skill data')
    // jetpack.write(path.resolve('./db/skills.json'), beautify(SkillNames, null, 2), { atomic: true })
  
    console.log('Saving class data')
    jetpack.write(path.resolve('./db/classes.json'), beautify(ClassNames, null, 2), { atomic: true })
  
    console.log('Saving item rarity data')
    jetpack.write(path.resolve('./db/itemRarity.json'), beautify(ItemRarity, null, 2), { atomic: true })
  
    console.log('Saving item type data')
    jetpack.write(path.resolve('./db/itemTypes.json'), beautify(ItemTypeToText, null, 2), { atomic: true })
  
    console.log('Saving item slot data')
    jetpack.write(path.resolve('./db/itemSlots.json'), beautify(ItemSlotToText, null, 2), { atomic: true })
  
    for (const _item of itemData[ItemsMainCategoriesType.OTHER]) {
      const item = _item as any
      item.icon = item.icon.replace('undefined', 'https://rune.game/')

      if (item.recipe) {
        item.recipe.requirement = item.recipe.requirement.map(r => ({...r, id: RuneNames[r.id]}))
      }

      if (!item.branches?.[1]) continue

      item.branches[1].attributes.map(a => ({...a, description: ItemAttributesById[a.id]?.description }))

      const itemJson = {
        "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description,
        "home_url": "https://rune.game",
        "external_url": "https://rune.game/catalog/" + item.id,
        "image_url": item.icon,
        "language": "en-US",
        ...item,
        "type": ItemTypeToText[item.type],
        "slots": item.slots.map(s => ItemSlotToText[s])
      } as any
      // const itemJson = {
      //   "id": 1,
      //   "name": "Steel",
      //   "icon": "/images/items/00001.png",
      //   "value": "0",
      //   "type": 1,
      //   "isNew": false,
      //   "isEquipable": true,
      //   "isUnequipable": false,
      //   "isTradeable": true,
      //   "isTransferable": true,
      //   "isCraftable": false,
      //   "isDisabled": false,
      //   "isRuneword": true,
      //   "isRetired": true,
      //   "createdDate": 12111,
      //   "hotness": 6,
      //   "recipe": {
      //     "requirement": [
      //       {
      //         "id": 2,
      //         "quantity": 1
      //       },
      //       {
      //         "id": 0,
      //         "quantity": 1
      //       }
      //     ]
      //   },
      //   "version": 3,
      //   "shortTokenId": "10030000101000900030002...694",
      //   "rarity": {
      //     "id": 6,
      //     "name": "Magical"
      //   },
      //   "tokenId": "100300001010009000300020000000000000000000000000000000000000000000000000694",
      //   "details": {
      //     "Type": "Sword",
      //     "Subtype": "Night Blade",
      //     "Rune Word": "Tir El",
      //     "Distribution": "Crafted",
      //     "Date": "April 20, 2021 - June 4, 2021",
      //     "Max Supply": "Unknown"
      //   },
      //   "branches": {
      //     "1": {
      //       "description": [
      //         "Made by Men, this blade is common but has minimal downsides."
      //       ],
      //       "attributes": [
      //         {
      //           "id": 1,
      //           "min": 5,
      //           "max": 15,
      //           "description": "{value}% Increased Harvest Yield"
      //         },
      //         {
      //           "id": 2,
      //           "min": 0,
      //           "max": 5,
      //           "description": "{value}% Harvest Fee"
      //         },
      //         {
      //           "id": 3,
      //           "min": 0,
      //           "max": 2,
      //           "description": "Harvest Fee Token: {value}",
      //           "map": {
      //             "0": "EL",
      //             "1": "ELD",
      //             "2": "TIR",
      //             "3": "NEF",
      //             "4": "ETH",
      //             "5": "ITH",
      //             "6": "TAL",
      //             "7": "RAL",
      //             "8": "ORT",
      //             "9": "THUL",
      //             "10": "AMN",
      //             "11": "SOL",
      //             "12": "SHAEL",
      //             "13": "DOL",
      //             "14": "HEL",
      //             "15": "IO",
      //             "16": "LUM",
      //             "17": "KO",
      //             "18": "FAL",
      //             "19": "LEM",
      //             "20": "PUL",
      //             "21": "UM",
      //             "22": "MAL",
      //             "23": "IST",
      //             "24": "GUL",
      //             "25": "VEX",
      //             "26": "OHM",
      //             "27": "LO",
      //             "28": "SUR",
      //             "29": "BER",
      //             "30": "JAH",
      //             "31": "CHAM",
      //             "32": "ZOD"
      //           }
      //         }
      //       ],
      //       "perfection": [
      //         15,
      //         0
      //       ]
      //     },
      //     "2": {
      //       "description": "Made by Men, this blade is common but has minimal downsides.",
      //       "attributes": [
      //         {
      //           "id": 1,
      //           "min": 16,
      //           "max": 20,
      //           "description": "{value}% Increased Attack Speed"
      //         },
      //         {
      //           "id": 3,
      //           "min": 6,
      //           "max": 8,
      //           "description": "{value}% Less Damage"
      //         },
      //         {
      //           "id": 4,
      //           "min": 81,
      //           "max": 100,
      //           "description": "{value} Increased Maximum Rage"
      //         },
      //         {
      //           "id": 5,
      //           "min": 3,
      //           "max": 5,
      //           "description": "{value} Increased Elemental Resists"
      //         },
      //         {
      //           "id": 7,
      //           "min": 3,
      //           "max": 5,
      //           "description": "{value} Increased Minion Attack Speed"
      //         },
      //         {
      //           "id": 8,
      //           "value": 3,
      //           "description": "{value} Increased Light Radius"
      //         }
      //       ]
      //     }
      //   },
      //   "shorthand": "9-3",
      //   "mods": [
      //     {
      //       "variant": 0,
      //       "value": 9,
      //       "attributeId": 1
      //     },
      //     {
      //       "variant": 0,
      //       "value": 3,
      //       "attributeId": 2
      //     },
      //     {
      //       "variant": 0,
      //       "value": 2,
      //       "attributeId": 3
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 694
      //     }
      //   ],
      //   "attributes": [
      //     {
      //       "id": 1,
      //       "min": 5,
      //       "max": 15,
      //       "description": "{value}% Increased Harvest Yield",
      //       "variant": 0,
      //       "value": 9,
      //       "attributeId": 1
      //     },
      //     {
      //       "id": 2,
      //       "min": 0,
      //       "max": 5,
      //       "description": "{value}% Harvest Fee",
      //       "variant": 0,
      //       "value": 3,
      //       "attributeId": 2
      //     },
      //     {
      //       "id": 3,
      //       "min": 0,
      //       "max": 2,
      //       "description": "Harvest Fee Token: {value}",
      //       "map": {
      //         "0": "EL",
      //         "1": "ELD",
      //         "2": "TIR",
      //         "3": "NEF",
      //         "4": "ETH",
      //         "5": "ITH",
      //         "6": "TAL",
      //         "7": "RAL",
      //         "8": "ORT",
      //         "9": "THUL",
      //         "10": "AMN",
      //         "11": "SOL",
      //         "12": "SHAEL",
      //         "13": "DOL",
      //         "14": "HEL",
      //         "15": "IO",
      //         "16": "LUM",
      //         "17": "KO",
      //         "18": "FAL",
      //         "19": "LEM",
      //         "20": "PUL",
      //         "21": "UM",
      //         "22": "MAL",
      //         "23": "IST",
      //         "24": "GUL",
      //         "25": "VEX",
      //         "26": "OHM",
      //         "27": "LO",
      //         "28": "SUR",
      //         "29": "BER",
      //         "30": "JAH",
      //         "31": "CHAM",
      //         "32": "ZOD"
      //       },
      //       "variant": 0,
      //       "value": 2,
      //       "attributeId": 3
      //     }
      //   ],
      //   "perfection": 0.4,
      //   "category": "weapon",
      //   "slots": [
      //     1,
      //     2
      //   ],
      //   "meta": {
      //     "harvestYield": 9,
      //     "harvestFeeToken": "TIR",
      //     "harvestFeePercent": 3,
      //     "harvestFees": {
      //       "TIR": 3
      //     },
      //     "chanceToSendHarvestToHiddenPool": 0,
      //     "chanceToLoseHarvest": 0,
      //     "harvestBurn": 0
      //   }
      // }
      
      delete itemJson.category
      delete itemJson.value
      delete itemJson.hotness
      delete itemJson.createdDate
      // delete item.shortTokenId
      // delete item.shorthand

      // if (!isToken) {
      //   delete item.tokenId
      //   delete item.rarity
      //   delete item.mods
      //   delete item.attributes
      //   delete item.perfection
      //   delete item.meta
      // }

      console.log('Saving item meta', itemJson.id)

      jetpack.write(path.resolve('./db/items/' + itemJson.id + '/meta.json'), beautify(itemJson, null, 2), { atomic: true })

      // const ipfs = ipfsClient.create({
      //   host: 'ipfs.rune.game',
      //   protocol: 'https',
      //   port: 443,
      //   apiPath: '/api/v0'
      // })

      // await ipfs.files.add('/items/999999.json', Buffer.from(beautify(itemJson, null, 2)))

      // const cid = await ipfs.add(
      //   { path: '/items/999999.json', content: beautify(itemJson, null, 2) }, 
      //   // { wrapWithDirectory: true }
      //   // cid: 'QmcZ774UPRJ3Qzuyg76ayc2AFM26ZfZQai8Ub5THKmwtbF', 
      // )

      // console.log(cid)

    }
  } catch (e) {
    console.log(e)
  }

  setTimeout(() => monitorMeta(app), 10 * 60 * 1000)
}