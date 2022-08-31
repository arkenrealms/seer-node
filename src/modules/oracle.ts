import Web3 from 'web3'
import { log } from '@rune-backend-sdk/util'

async function calculateGameRewards(app) {
  // Update current rewards to the previous calculation
  app.db.evolution.config.itemRewards = app.db.evolution.config.itemRewardsQueued
  app.db.evolution.config.rewardWinnerAmountPerLegitPlayer = app.db.evolution.config.rewardWinnerAmountPerLegitPlayerQueued
  app.db.evolution.config.rewardWinnerAmountMax = app.db.evolution.config.rewardWinnerAmountMaxQueued

  let rewardWinnerAmountPerLegitPlayer = 0
  let rewardWinnerAmountMax = 0

  // Set the round reward based on vault zod income in last 1 week, and the desired average player count for 2016 rounds per week
  rewardWinnerAmountMax = (app.db.oracle.inflow.crafting.tokens.week.zod * app.db.oracle.incomeRewarded) / app.db.oracle.roundsPerWeek / app.db.oracle.estimatedActivePlayerCount / app.db.oracle.consolidationPrizeMultiplier * app.db.oracle.boostMultiplier
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
  app.db.evolution.config.itemRewardsQueued = itemRewards
  app.db.evolution.config.rewardWinnerAmountPerLegitPlayerQueued = rewardWinnerAmountPerLegitPlayer
  app.db.evolution.config.rewardWinnerAmountMaxQueued = rewardWinnerAmountMax

  log('New evolution config: ', app.db.evolution.config)
}

async function runOracle(app) {
  log('[Oracle] Running')

  try {
    const now = new Date().getTime()

    // Custom
    {
      // app.db.oracle.inflow.fundraisers.tokens.month.rxs = (1000000 + 500000 + 200000)
      // app.db.oracle.inflow.fundraisers.tokens.week.rxs = (200000 + 100000)

      // app.db.oracle.outflow.salaries.tokens.week.usd = 2000
      // app.db.oracle.inflow.investments.tokens.week.usd = 2000
    }

    if (now > app.db.oracle.lastYearDate + (365 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastYearDate = now

      for (const key of ['crafting', 'fundraisers', 'investments', 'marketFees', 'characterFees']) {
        for (const rune of Object.keys(app.db.oracle.inflow[key].tokens.year)) {
          if (!app.db.oracle.inflow[key].tokens.total) app.db.oracle.inflow[key].tokens.total = {}
          if (!app.db.oracle.inflow[key].tokens.total[rune]) app.db.oracle.inflow[key].tokens.total[rune] = 0

          app.db.oracle.inflow[key].tokens.total[rune] += app.db.oracle.inflow[key].tokens.year[rune]
        }

        app.db.oracle.inflow[key].tokens.year = {...app.db.oracle.defaultTokens}
      }

      for (const key of ['evolutionRewards', 'infiniteRewards', 'salaries', 'affiliates', 'giveaways']) {
        for (const rune of Object.keys(app.db.oracle.outflow[key].tokens.year)) {
          if (!app.db.oracle.outflow[key].tokens.total) app.db.oracle.outflow[key].tokens.total = {}
          if (!app.db.oracle.outflow[key].tokens.total[rune]) app.db.oracle.outflow[key].tokens.total[rune] = 0

          app.db.oracle.outflow[key].tokens.total[rune] += app.db.oracle.outflow[key].tokens.year[rune]
        }

        app.db.oracle.outflow[key].tokens.year = {...app.db.oracle.defaultTokens}
      }
    }

    if (now > app.db.oracle.lastMonthDate + (30 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastMonthDate = now

      for (const key of ['crafting', 'fundraisers', 'investments', 'marketFees', 'characterFees']) {
        for (const rune of Object.keys(app.db.oracle.inflow[key].tokens.month)) {
          app.db.oracle.inflow[key].tokens.year[rune] += app.db.oracle.inflow[key].tokens.month[rune]
        }

        app.db.oracle.inflow[key].tokens.month = {...app.db.oracle.defaultTokens}
      }

      for (const key of ['evolutionRewards', 'infiniteRewards', 'salaries', 'affiliates', 'giveaways']) {
        for (const rune of Object.keys(app.db.oracle.outflow[key].tokens.month)) {
          app.db.oracle.outflow[key].tokens.year[rune] += app.db.oracle.outflow[key].tokens.month[rune]
        }

        app.db.oracle.outflow[key].tokens.month = {...app.db.oracle.defaultTokens}
      }
    }
  
    if (now > app.db.oracle.lastWeekDate + (7 * 24 * 60 * 60 * 1000)) {
      app.db.oracle.lastWeekDate = now

      await calculateGameRewards(app) // Needs to be done before reset

      for (const key of ['crafting', 'fundraisers', 'investments', 'marketFees', 'characterFees']) {
        for (const rune of Object.keys(app.db.oracle.inflow[key].tokens.week)) {
          app.db.oracle.inflow[key].tokens.month[rune] += app.db.oracle.inflow[key].tokens.week[rune]
        }

        app.db.oracle.inflow[key].tokens.week = {...app.db.oracle.defaultTokens}
      }

      for (const key of ['evolutionRewards', 'infiniteRewards', 'salaries', 'affiliates', 'giveaways']) {
        for (const rune of Object.keys(app.db.oracle.outflow[key].tokens.week)) {
          app.db.oracle.outflow[key].tokens.month[rune] += app.db.oracle.outflow[key].tokens.week[rune]
        }

        app.db.oracle.outflow[key].tokens.week = {...app.db.oracle.defaultTokens}
      }
    }

    // app.db.oracle.totals = {
    //   inflow: {
    //     tokens: {
    //       week: {...app.db.oracle.defaultTokens},
    //       month: {...app.db.oracle.defaultTokens},
    //       year: {...app.db.oracle.defaultTokens},
    //     }
    //   },
    //   outflow: {
    //     tokens: {
    //       week: {...app.db.oracle.defaultTokens},
    //       month: {...app.db.oracle.defaultTokens},
    //       year: {...app.db.oracle.defaultTokens},
    //     }
    //   }
    // }

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
  
  if (!app.db.oracle) {
    const now = new Date().getTime()

    app.db.oracle = {
      incomeRewarded: 0.25,
      roundsPerWeek: 7 * 24 * 60 / 5,
      estimatedActivePlayerCount: 10,
      boostMultiplier: 3,
      consolidationPrizeMultiplier: 1.75,
      lastWeekDate: now,
      lastMonthDate: now,
      lastYearDate: now,
      defaultTokens: {...defaultTokens},
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
            week: {usd: 0, rxs: 0},
            month: {usd: 0, rxs: 0},
            year: {usd: 0, rxs: 0},
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
      }
    } as any
  }


  if (!app.db.oracle.outflow.salaries) {
    app.db.oracle.outflow.salaries = {
      tokens: {
        week: {usd: 0},
        month: {usd: 0},
        year: {usd: 0},
      }
    }
  }

  if (!app.db.oracle.inflow.investments) {
    app.db.oracle.inflow.investments = {
      tokens: {
        week: {usd: 0},
        month: {usd: 0},
        year: {usd: 0},
      }
    }
  }

  if (!app.db.oracle.inflow.marketFees) {
    app.db.oracle.inflow.marketFees = {
      tokens: {
        week: {rxs: 0},
        month: {rxs: 0},
        year: {rxs: 0},
      }
    }
  }

  if (!app.db.oracle.inflow.characterFees) {
    app.db.oracle.inflow.characterFees = {
      tokens: {
        week: {rxs: 0},
        month: {rxs: 0},
        year: {rxs: 0},
      }
    }
  }

  if (!app.db.oracle.outflow.affiliates) {
    app.db.oracle.outflow.affiliates = {
      tokens: {
        week: {...defaultTokens},
        month: {...defaultTokens},
        year: {...defaultTokens},
      }
    }
  }

  if (!app.db.oracle.outflow.giveaways) {
    app.db.oracle.outflow.giveaways = {
      tokens: {
        week: {...defaultTokens},
        month: {...defaultTokens},
        year: {...defaultTokens},
      }
    }
  }

  setTimeout(() => runOracle(app), 20 * 1000)
}