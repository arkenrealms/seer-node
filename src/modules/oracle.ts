import Web3 from 'web3'
import { log } from '@rune-backend-sdk/util'

async function calculateGameRewards(app) {
  // Update current rewards to the previous calculation
  app.evolution.config.itemRewards = app.evolution.config.itemRewardsQueued
  app.evolution.config.rewardWinnerAmountPerLegitPlayer = app.evolution.config.rewardWinnerAmountPerLegitPlayerQueued
  app.evolution.config.rewardWinnerAmountMax = app.evolution.config.rewardWinnerAmountMaxQueued

  let rewardWinnerAmountPerLegitPlayer = 0
  let rewardWinnerAmountMax = 0

  const incomeRewarded = 0.25
  const roundsPerWeek = 2016
  const desiredPlayerCount = 10
  const boostMultiplier = 3
  const consolidationPrizeMultiplier = 1.75

  // Set the round reward based on vault zod income in last 1 week, and the desired average player count for 2016 rounds per week
  rewardWinnerAmountMax = (app.oracle.income.week.runes.zod * incomeRewarded) / roundsPerWeek / desiredPlayerCount / consolidationPrizeMultiplier * boostMultiplier
  rewardWinnerAmountPerLegitPlayer = rewardWinnerAmountMax / desiredPlayerCount

  // Round to the nearest 0.005
  rewardWinnerAmountPerLegitPlayer = parseFloat((Math.ceil(rewardWinnerAmountPerLegitPlayer * 200) / 200).toFixed(3))
  rewardWinnerAmountMax = parseFloat((Math.ceil(rewardWinnerAmountMax * 200) / 200).toFixed(3))

  // Set min
  if (rewardWinnerAmountPerLegitPlayer < 0.005)
      rewardWinnerAmountPerLegitPlayer = 0.005
  if (rewardWinnerAmountMax < 0.3)
      rewardWinnerAmountMax = 0.3

  // Set max
  if (rewardWinnerAmountPerLegitPlayer > 0.1)
      rewardWinnerAmountPerLegitPlayer = 0.1
  if (rewardWinnerAmountMax > 1)
      rewardWinnerAmountMax = 1

  const itemRewards = {
    items: [],
    runes: []
  }

  // Set the rune rewards based on vault rune income in last 1 week
  for (const rune of app.oracle.income.runes) {
    itemRewards.runes.push({
      type: 'rune',
      symbol: rune,
      quantity: app.oracle.income.week.runes[rune] * incomeRewarded
    })
  }

  // Update the next queued rewards to the current calculation
  app.evolution.config.itemRewardsQueued = itemRewards
  app.evolution.config.rewardWinnerAmountPerLegitPlayerQueued = rewardWinnerAmountPerLegitPlayer
  app.evolution.config.rewardWinnerAmountMaxQueued = rewardWinnerAmountMax
}

async function runOracle(app) {
  try {
    const now = new Date().getTime()

    if (now > app.oracle.lastYearDate + (7 * 24 * 60 * 60 * 1000)) {
      app.oracle.lastYearDate = now

      app.oracle.income.runes.year = {...app.oracle.defaultRunes}
      app.oracle.rewarded.runes.year = {...app.oracle.defaultRunes}
    }

    if (now > app.oracle.lastMonthDate + (30 * 24 * 60 * 60 * 1000)) {
      app.oracle.lastMonthDate = now

      for (const rune of Object.keys(app.oracle.income.runes.month)) {
        app.oracle.income.runes.year[rune] += app.oracle.income.runes.month[rune]
      }

      for (const rune of Object.keys(app.oracle.rewarded.runes.month)) {
        app.oracle.rewarded.runes.year[rune] += app.oracle.rewarded.runes.month[rune]
      }

      app.oracle.income.runes.month = {...app.oracle.defaultRunes}
      app.oracle.rewarded.runes.month = {...app.oracle.defaultRunes}
    }
  
    if (now > app.oracle.lastWeekDate + (365 * 24 * 60 * 60 * 1000)) {
      app.oracle.lastWeekDate = now

      for (const rune of Object.keys(app.oracle.income.runes.week)) {
        app.oracle.income.runes.month[rune] += app.oracle.income.runes.week[rune]
      }

      for (const rune of Object.keys(app.oracle.rewarded.runes.week)) {
        app.oracle.rewarded.runes.month[rune] += app.oracle.rewarded.runes.week[rune]
      }

      await calculateGameRewards(app)

      // Reset the rune values to zero
      app.oracle.income.runes.week = {...app.oracle.defaultRunes}
      app.oracle.rewarded.runes.week = {...app.oracle.defaultRunes}
    }
  } catch(e) {
    log('Error', e)
  }

  setTimeout(() => runOracle(app), 30 * 60 * 1000)
}

export async function monitorOracle(app) {
  const now = new Date().getTime()

  if (!app.oracle) {
    const defaultRunes = {
      "el": 0,
      "tir": 0,
      "eld": 0,
      "nef": 0,
      "ith": 0,
      "tal": 0,
      "ort": 0,
      "thul": 0,
      "amn": 0,
      "bnb": 0,
      "sol": 0,
      "wbnb": 0,
      "shael": 0,
      "dol": 0,
      "hel": 0,
      "io": 0,
      "lum": 0,
      "ko": 0,
      "fal": 0,
      "lem": 0,
      "pul": 0,
      "um": 0,
      "mal": 0,
      "ist": 0,
      "gul": 0,
      "vex": 0,
      "ohm": 0,
      "lo": 0,
      "sur": 0,
      "ber": 0,
      "jah": 0,
      "cham": 0,
      "zod": 0,
    }
  
    app.oracle = {
      lastWeekDate: now,
      lastMonthDate: now,
      lastYearDate: now,
      income: {
        runes: {
          week: {...defaultRunes},
          month: {...defaultRunes},
          year: {...defaultRunes},
        }
      },
      rewarded: {
        runes: {
          week: {...defaultRunes},
          month: {...defaultRunes},
          year: {...defaultRunes},
        }
      },
      defaultRunes
    } as any
  }

  setTimeout(() => runOracle(app), 1 * 60 * 1000)
}