import { itemData, ItemAttributesById, mapIdToSlot } from '../data/items.mjs'
import { ItemsMainCategoriesType } from '../data/items.type.mjs'

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length

export function decodeItem(tokenId) {
  const defaultItem = {
    tokenId,
    details: {},
    branches: {},
    shorthand: '',
    mods: [],
    attributes: [],
    perfection: null,
    meta: {
      harvestYield: 0,
      harvestFeeToken: '',
      harvestFeePercent: 0,
      harvestFees: {},
      chanceToSendHarvestToHiddenPool: 0,
      chanceToLoseHarvest: 0,
      harvestBurn: 0,
    },
  }

  if (!tokenId || parseInt(tokenId) === 0 || Number.isNaN(parseInt(tokenId))) return

  const version = parseInt(tokenId.slice(1, 4))
  const id = parseInt(tokenId.slice(4, 9))

  let type = 0
  let modStart = 9

  if (version === 1) {
    modStart = 9
  } else {
    type = parseInt(tokenId.slice(9, 11))
    modStart = 11
  }

  const mods = []

  let modIndex = modStart
  while (modIndex < tokenId.length) {
    const variant = parseInt(tokenId.slice(modIndex, modIndex + 1))

    if (variant === 2) {
      const attributeId = parseInt(tokenId.slice(modIndex + 1, modIndex + 4))
      const value = parseInt(tokenId.slice(modIndex + 4, modIndex + 7))

      if (Number.isNaN(value)) break

      mods.push({
        variant,
        attributeId,
        value,
      })

      modIndex += 7
    } else {
      const value = parseInt(tokenId.slice(modIndex + 1, modIndex + 4))

      if (Number.isNaN(value)) break

      mods.push({
        variant,
        value,
      })

      modIndex += 4
    }
  }

  const item = {
    ...defaultItem,
    ...itemData[ItemsMainCategoriesType.OTHER].find((i) => i.id === id),
    version,
    id,
    type,
    mods,
    shortTokenId: `${tokenId.slice(0, 23)}...${tokenId.slice(-3)}`,
  }

  const branch = item.branches[1]
  const branchAttributes = branch ? JSON.parse(JSON.stringify(branch.attributes)) : {}

  const actionMetadata = {
    harvestYield: 0,
    pending: 0,
    bonus: 0,
    harvestBurn: 0,
    chanceToSendHarvestToHiddenPool: 0,
    chanceToLoseHarvest: 0,
    guildId: null,
    characterId: null,
    tokenId: null,
    itemIndex: 0,
    itemLength: 0,
    modIndex: 0,
    modLength: 0,
    rand: 0,
    removeFees: 0,
    freezeFees: 0,
    magicFind: 0,
    unableUseRuneword: null,
    currentRewardToken: null,
    hasEarlyUnstakeLocked: null,
    hasEarlyUnstakeNoReward: null,
    hiddenPoolPid: null,
    swapToken: null,
    swapAmount: null,
    feeToken: null,
    feeAmount: null,
    harvestFeeToken: '',
    harvestFeePercent: 0,
    harvestFees: {},
  }

  item.attributes = []

  let prevMod = null

  if (item.id === 1) {
    item.mods[0].attributeId = 1
    item.mods[1].attributeId = 2
    item.mods[2].attributeId = 3
  } else if (item.id === 2) {
    item.mods[0].attributeId = 1
    item.mods[1].attributeId = 4
    item.mods[2].attributeId = 5
  } else if (item.id === 3) {
    item.mods[0].attributeId = 1
    item.mods[1].attributeId = 6
  } else if (item.id === 4) {
    item.mods[0].attributeId = 7
  }

  for (const i in item.mods) {
    const mod = item.mods[i]
    const branchAttribute = branchAttributes[i]
    if (mod.attributeId === 1) {
      actionMetadata.harvestYield += mod.value

      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    } else if (mod.attributeId === 2) {
      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    } else if (mod.attributeId === 3) {
      actionMetadata.harvestFees[branchAttribute.map[mod.value]] = prevMod.value

      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
        // value: branchAttribute.map[mod.value],
      })
    } else if (mod.attributeId === 4) {
      actionMetadata.chanceToSendHarvestToHiddenPool += mod.value

      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    } else if (mod.attributeId === 5) {
      actionMetadata.chanceToLoseHarvest += mod.value

      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    } else if (mod.attributeId === 6) {
      actionMetadata.harvestBurn += mod.value

      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    } else if (mod.attributeId > 0 && ItemAttributesById[mod.attributeId]) {
      item.attributes.push({
        ...ItemAttributesById[mod.attributeId],
        ...branchAttribute,
        ...mod,
      })
    }

    prevMod = mod
  }

  if (actionMetadata.harvestYield) {
    item.meta.harvestYield = actionMetadata.harvestYield
  }
  if (actionMetadata.harvestFees) {
    item.meta.harvestFees = actionMetadata.harvestFees
    item.meta.harvestFeeToken = Object.keys(actionMetadata.harvestFees)[0]
    item.meta.harvestFeePercent = actionMetadata.harvestFees[Object.keys(actionMetadata.harvestFees)[0]]
  }
  if (actionMetadata.chanceToSendHarvestToHiddenPool) {
    item.meta.chanceToSendHarvestToHiddenPool += actionMetadata.chanceToSendHarvestToHiddenPool
  }
  if (actionMetadata.chanceToLoseHarvest) {
    item.meta.chanceToLoseHarvest += actionMetadata.chanceToLoseHarvest
  }
  if (actionMetadata.harvestBurn) {
    item.meta.harvestBurn = actionMetadata.harvestBurn
  }

  if (branch && branch.perfection) {
    const perfection = JSON.parse(JSON.stringify(branch.perfection))

    if (item.tokenId === '1001000041000100015647') {
      console.log(perfection)
      console.log(item.attributes)
      console.log(branch.attributes)
    }
    if (perfection.length) {
      if (perfection[0] !== undefined && item.attributes[0] && branch.attributes[0])
        perfection[0] =
          perfection[0] === branch.attributes[0].max
            ? ((perfection[0] - branch.attributes[0].min) === 0 ? 1 : (item.attributes[0].value - branch.attributes[0].min) / (perfection[0] - branch.attributes[0].min))
            : ((branch.attributes[0].max - perfection[0]) === 0 ? 1 : 1 - (item.attributes[0].value - perfection[0]) / (branch.attributes[0].max - perfection[0]))
      if (perfection[1] !== undefined && item.attributes[1] && branch.attributes[1])
        perfection[1] =
          perfection[1] === branch.attributes[1].max
            ? ((perfection[1] - branch.attributes[1].min) === 0 ? 1 : (item.attributes[1].value - branch.attributes[1].min) / (perfection[1] - branch.attributes[1].min))
            : ((branch.attributes[1].max - perfection[1]) === 0 ? 1 : 1 - (item.attributes[1].value - perfection[1]) / (branch.attributes[1].max - perfection[1]))
      if (perfection[2] !== undefined && item.attributes[2] && branch.attributes[2])
        perfection[2] =
          perfection[2] === branch.attributes[2].max
            ? ((perfection[2] - branch.attributes[2].min) === 0 ? 1 : (item.attributes[2].value - branch.attributes[2].min) / (perfection[2] - branch.attributes[2].min))
            : ((branch.attributes[2].max - perfection[2]) === 0 ? 1 : 1 - (item.attributes[2].value - perfection[2]) / (branch.attributes[2].max - perfection[2]))

      item.perfection = average(perfection)
      if (item.tokenId === '1001000041000100015647') {
        console.log(perfection, branch.attributes[0].max, perfection[0], 1)
      }

      if (!Number.isFinite(item.perfection)) item.perfection = null

      item.shorthand = ``

      if (perfection[0] !== undefined && item.attributes[0] !== undefined) {
        item.shorthand += item.attributes[0].value
      }

      if (perfection[1] !== undefined && item.attributes[1] !== undefined) {
        item.shorthand += '-' + item.attributes[1].value
      }

      if (perfection[2] !== undefined && item.attributes[2] !== undefined) {
        item.shorthand +=
          '-' +
          (branch.attributes[2].map ? branch.attributes[2].map[item.attributes[2].value] : item.attributes[2].value)
      }
    }
  }

  const slotId = mapIdToSlot[id]

  // item.meta = {
  //   harvestYield: 0,
  //   harvestFeeToken: '',
  //   harvestFeePercent: 0,
  //   harvestFees: {},
  //   chanceToSendHarvestToHiddenPool: 0,
  //   chanceToLoseHarvest: 0,
  //   harvestBurn: 0,
  // }

  return {
    ...item,
    tokenId,
    slotId,
  }
}
