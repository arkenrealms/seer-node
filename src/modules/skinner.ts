import * as ethers from 'ethers'
import beautify from 'json-beautify'
import jetpack from 'fs-jetpack'
import path from 'path'
import fs from 'fs'
import { log, removeDupes } from '@rune-backend-sdk/util'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'
import { achievementData } from '@rune-backend-sdk/data/achievements'
import Profile from '@rune-backend-sdk/models/profile'
import Account from '@rune-backend-sdk/models/account'
import Model from '@rune-backend-sdk/models/base'
import { itemData, ItemTypeToText, ItemSlotToText, RuneNames, ItemAttributesById, ItemAttributes, SkillNames, ClassNames, ItemRarity } from '@rune-backend-sdk/data/items'
import { userInfo } from 'os'
import { getUsername } from '../util/getUsername'

const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
}

const imageCache = {}
const images = []
const checkPixelSimilarity = false

async function determineFiles(app) {
  log('[skinner] Determining files')

  try {
    const itemSlugs = ['guiding-light']

    for (const itemSlug of itemSlugs) {
      const item = itemData.runeword.find(r => r.name.replace(' ', '-').replace("'", '').toLowerCase() === itemSlug)

      // if (app.db.skins[item.id]) continue

      log('Skinning ' + itemSlug)

      const comparer = (rarity, length) => {
        return (oldFilename, index) => {
          console.log(`${rarity} ${index}/${length}`)

          const filename = `${rarity}-${index}.png`

          if (oldFilename !== filename && oldFilename.indexOf(rarity) !== 0) {
            jetpack.rename(path.resolve(`./db/images/skins/${itemSlug}/${rarity}/${oldFilename}`), filename)
          }

          if (checkPixelSimilarity) {
            const image = PNG.sync.read(fs.readFileSync(path.resolve(`./db/images/skins/${itemSlug}/${rarity}/${filename}`)))
            const {width, height} = image
            const diff = new PNG({width, height})
    
            for (const img2 of images) {
              if (img2.filename === filename) continue
    
              const difference = pixelmatch(image.data, img2.image.data, diff.data, width, height, { threshold: 0.1 })
    
              if (difference < (width * height) * 0.01) {
                console.log(`Pretty close match: /images/skins/${itemSlug}/${rarity}/${filename} / ${img2.filename}`)
                return
              }
            }
  
            images.push({
              filename,
              image
            })
          }
  
          const cacheKey = base64_encode(path.resolve(`./db/images/skins/${itemSlug}/${rarity}/${filename}`))

          if (imageCache[cacheKey]) {
            log(`Image existed: /images/skins/${itemSlug}/${rarity}/${filename}`)
            return
          }
  
          imageCache[cacheKey] = true
  
          return `/images/skins/${itemSlug}/${rarity}/${filename}`
        }
      }

      let magical = (await jetpack.listAsync(path.resolve(`./db/images/skins/${itemSlug}/magical`))).filter(s => s.indexOf('png') > 0)
      let rare = (await jetpack.listAsync(path.resolve(`./db/images/skins/${itemSlug}/rare`))).filter(s => s.indexOf('png') > 0)
      let epic = (await jetpack.listAsync(path.resolve(`./db/images/skins/${itemSlug}/epic`))).filter(s => s.indexOf('png') > 0)
      let mythic = (await jetpack.listAsync(path.resolve(`./db/images/skins/${itemSlug}/mythic`))).filter(s => s.indexOf('png') > 0)
      
      magical = magical.map(comparer('magical', magical.length)).filter(s => !!s)
      rare = rare.map(comparer('rare', rare.length)).filter(s => !!s)
      epic = epic.map(comparer('epic', epic.length)).filter(s => !!s)
      mythic = mythic.map(comparer('mythic', mythic.length)).filter(s => !!s)

      log(`Skinned ${mythic.length} Mythic`)
      log(`Skinned ${epic.length} Epic`)
      log(`Skinned ${rare.length} Rare`)
      log(`Skinned ${magical.length} Magical`)

      app.db.skins[item.id] = {
        magical,
        rare,
        epic,
        mythic
      }

      app.db.queueSave(() => app.db.saveSkins())
    }
  } catch(e) {
    log('[skinner] Error', e)
  }

  setTimeout(() => determineFiles(app), 30 * 60 * 1000)
}

export async function initSkinner(app) {
  if (!app.skinner) {
    app.skinner = {}
  }

  await determineFiles(app)
}
