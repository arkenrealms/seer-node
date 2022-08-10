import Web3 from 'web3'
import { log } from '@rune-backend-sdk/util'

async function calculateGameRewards(app) {
  // Update current rewards to the previous calculation
  app.evolution.config.itemRewards = app.evolution.config.itemRewardsQueued
  app.evolution.config.rewardWinnerAmountPerLegitPlayer = app.evolution.config.rewardWinnerAmountPerLegitPlayerQueued
  app.evolution.config.rewardWinnerAmountMax = app.evolution.config.rewardWinnerAmountMaxQueued

  let rewardWinnerAmountPerLegitPlayer = 0
  let rewardWinnerAmountMax = 0

  // Set the round reward based on vault zod income in last 1 week, and the desired average player count for 2016 rounds per week
  rewardWinnerAmountMax = (app.db.oracle.inflow.crafting.week.tokens.zod * app.db.oracle.incomeRewarded) / app.db.oracle.roundsPerWeek / app.db.oracle.estimatedActivePlayerCount / app.db.oracle.consolidationPrizeMultiplier * app.db.oracle.boostMultiplier
  rewardWinnerAmountPerLegitPlayer = rewardWinnerAmountMax / app.db.oracle.estimatedActivePlayerCount

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
  for (const rune of app.db.oracle.inflow.crafting.tokens) {
    itemRewards.runes.push({
      type: 'rune',
      symbol: rune,
      quantity: app.db.oracle.inflow.crafting.week.tokens[rune] * app.db.oracle.incomeRewarded
    })
  }

  // Update the next queued rewards to the current calculation
  app.evolution.config.itemRewardsQueued = itemRewards
  app.evolution.config.rewardWinnerAmountPerLegitPlayerQueued = rewardWinnerAmountPerLegitPlayer
  app.evolution.config.rewardWinnerAmountMaxQueued = rewardWinnerAmountMax
}

async function runOracle(app) {
  log('[Oracle] Running')

  try {
    const now = new Date().getTime()

    // Custom
    {
      app.db.oracle.inflow.fundraisers.tokens.month.rxs = (1000000 + 500000 + 200000)
      app.db.oracle.inflow.fundraisers.tokens.week.rxs = (200000 + 100000)

      if (!app.db.oracle.outflow.salaries) {
        app.db.oracle.outflow.salaries = {
          tokens: {
            week: {...app.db.oracle.defaultTokens},
            month: {...app.db.oracle.defaultTokens},
            year: {...app.db.oracle.defaultTokens},
          }
        }
      }

      app.db.oracle.outflow.salaries.tokens.week.usd = 2000

      if (!app.db.oracle.inflow.investments) {
        app.db.oracle.inflow.investments = {
          tokens: {
            week: {...app.db.oracle.defaultTokens},
            month: {...app.db.oracle.defaultTokens},
            year: {...app.db.oracle.defaultTokens},
          }
        }
      }

      app.db.oracle.inflow.investments.tokens.week.usd = 2000
    }

    if (now > app.db.oracle.lastYearDate + (7 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastYearDate = now

      app.db.oracle.inflow.crafting.tokens.year = {...app.db.oracle.defaultTokens}
      app.db.oracle.outflow.evolutionRewards.tokens.year = {...app.db.oracle.defaultTokens}
    }

    if (now > app.db.oracle.lastMonthDate + (30 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastMonthDate = now

      for (const rune of Object.keys(app.db.oracle.inflow.crafting.tokens.month)) {
        app.db.oracle.inflow.crafting.tokens.year[rune] += app.db.oracle.inflow.crafting.tokens.month[rune]
      }

      for (const rune of Object.keys(app.db.oracle.outflow.evolutionRewards.tokens.month)) {
        app.db.oracle.outflow.evolutionRewards.tokens.year[rune] += app.db.oracle.outflow.evolutionRewards.tokens.month[rune]
      }

      app.db.oracle.inflow.crafting.tokens.month = {...app.db.oracle.defaultTokens}
      app.db.oracle.outflow.evolutionRewards.tokens.month = {...app.db.oracle.defaultTokens}
    }
  
    if (now > app.db.oracle.lastWeekDate + (365 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastWeekDate = now

      for (const rune of Object.keys(app.db.oracle.inflow.crafting.tokens.week)) {
        app.db.oracle.inflow.crafting.tokens.month[rune] += app.db.oracle.inflow.crafting.tokens.week[rune]
      }

      for (const rune of Object.keys(app.db.oracle.outflow.evolutionRewards.tokens.week)) {
        app.db.oracle.outflow.evolutionRewards.tokens.month[rune] += app.db.oracle.outflow.evolutionRewards.tokens.week[rune]
      }

      await calculateGameRewards(app)

      // Reset the rune values to zero
      app.db.oracle.inflow.crafting.tokens.week = {...app.db.oracle.defaultTokens}
      app.db.oracle.outflow.evolutionRewards.tokens.week = {...app.db.oracle.defaultTokens}
    }

    app.db.oracle.totals = {
      inflow: {
        tokens: {
          week: {...app.db.oracle.defaultTokens},
          month: {...app.db.oracle.defaultTokens},
          year: {...app.db.oracle.defaultTokens},
        }
      },
      outflow: {
        tokens: {
          week: {...app.db.oracle.defaultTokens},
          month: {...app.db.oracle.defaultTokens},
          year: {...app.db.oracle.defaultTokens},
        }
      }
    }

    for (const inflowKey of app.db.oracle.inflow) {
      for (const periodKey in inflowKey) {
        const period = inflowKey[periodKey]
        for (const tokenKey in period.tokens) {
          const token = period.tokens[tokenKey]
          app.db.oracle.totals.inflow.tokens[periodKey][tokenKey] += token
        }
      }
    }

    for (const outflowKey of app.db.oracle.outflow) {
      for (const periodKey in outflowKey) {
        const period = outflowKey[periodKey]
        for (const tokenKey in period.tokens) {
          const token = period.tokens[tokenKey]
          app.db.oracle.totals.outflow.tokens[periodKey][tokenKey] += token
        }
      }
    }
  } catch(e) {
    log('Error', e)
  }

  setTimeout(() => runOracle(app), 30 * 60 * 1000)
}

export async function monitorOracle(app) {
  if (!app.db.oracle) {
    const now = new Date().getTime()
  
    const defaultTokens = {
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
      "usd": 0,
      "rxs": 0,
      "rune": 0
    }
  
    app.db.oracle = {
      incomeRewarded: 0.25,
      roundsPerWeek: 7 * 24 * 60 / 5,
      estimatedActivePlayerCount: 10,
      boostMultiplier: 3,
      consolidationPrizeMultiplier: 1.75,
      lastWeekDate: now,
      lastMonthDate: now,
      lastYearDate: now,
      totals: {
        inflow: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        },
        outflow: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        }
      },
      inflow: {
        crafting: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        },
        fundraisers: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        }
      },
      outflow: {
        evolutionRewards: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        },
        infiniteRewards: {
          tokens: {
            week: {...defaultTokens},
            month: {...defaultTokens},
            year: {...defaultTokens},
          }
        }
      },
      defaultTokens: {...defaultTokens}
    } as any
  }

  setTimeout(() => runOracle(app), 0)
}