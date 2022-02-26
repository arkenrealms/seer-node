import * as ethers from 'ethers'
import BigNumber from 'bignumber.js'
import { average, toShort } from '@rune-backend-sdk/util'
import { log } from '@rune-backend-sdk/util'
import { getAddress } from '@rune-backend-sdk/util/web3'
import farmsData, { QuoteToken } from '@rune-backend-sdk/farmInfo'

export async function monitorGeneralStats(app) {
  try {
    log('[Stats] Updating')

    try {
      app.db.stats.totalCharacters = (await app.contracts.characters.totalSupply()).toNumber()

      if (!app.db.stats.characters) app.db.stats.characters = {}
    
      for (let i = 1; i <= 7; i++) {
        if (!app.db.stats.characters[i]) app.db.stats.characters[i] = {}

        app.db.stats.characters[i].total = (await app.contracts.characters.characterCount(i)).toNumber()
      }
    } catch (e) {
      console.error(e)
    }

    try {
      app.db.stats.totalItems = (await app.contracts.items.totalSupply()).toNumber()

      if (!app.db.stats.items) app.db.stats.items = {}
    
      for (let i = 1; i <= 30; i++) {
        if (!app.db.stats.items[i]) app.db.stats.items[i] = {}

        app.db.stats.items[i].total = (await app.contracts.items.itemCount(i)).toNumber()
        app.db.stats.items[i].burned = (await app.contracts.items.itemBurnCount(i)).toNumber()
      }
    } catch (e) {
      console.error(e)
    }

    // const arcaneRaidContract = new ethers.Contract(getAddress(app.contracts.raid), ArcaneRaidV1.abi, signer)

    // Update farms
    {
      log('Update farms')

      if (!app.db.stats.prices) app.db.stats.prices = { busd: 1 }
      if (!app.db.stats.liquidity) app.db.stats.liquidity = {}
      app.db.stats.totalBusdLiquidity = 0
      app.db.stats.totalBnbLiquidity = 0
    
      for (let i = 0; i < farmsData.length; i++) {
        const farm = farmsData[i] as any
        try {
          // log(farm.lpSymbol)
        
          if (farm.lpSymbol.indexOf('BUSD') !== -1) {
            const value = toShort(await app.contracts.busd.balanceOf(getAddress(farm.lpAddresses)))
            
            // log('has', value)

            if (!['USDT-BUSD LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
              if (!app.db.stats.liquidity[farm.lpSymbol]) app.db.stats.liquidity[farm.lpSymbol] = {}
              app.db.stats.liquidity[farm.lpSymbol].value = value
        
              app.db.stats.totalBusdLiquidity += value
            }
          } else if (farm.lpSymbol.indexOf('BNB') !== -1) {
            const value = toShort(await app.contracts.wbnb.balanceOf(getAddress(farm.lpAddresses)))
            
            // log('has', value)
      
            if (!['BTCB-BNB LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
              if (!app.db.stats.liquidity[farm.lpSymbol]) app.db.stats.liquidity[farm.lpSymbol] = {}
              app.db.stats.liquidity[farm.lpSymbol].value = value
      
              app.db.stats.totalBnbLiquidity += value
            }
          }
      
          const lpAddress = getAddress(farm.isTokenOnly ? farm.tokenLpAddresses : farm.lpAddresses)

          const tokenContract = new ethers.Contract(getAddress(farm.tokenAddresses), app.contractMetadata.BEP20.abi, app.signers.read)
          const lpContract = new ethers.Contract(farm.isTokenOnly ? getAddress(farm.tokenAddresses) : lpAddress, app.contractMetadata.BEP20.abi, app.signers.read)
          const quotedContract = new ethers.Contract(getAddress(farm.quoteTokenAdresses), app.contractMetadata.BEP20.abi, app.signers.read)
      
          const tokenBalanceLP = (await tokenContract.balanceOf(lpAddress)).toString()
          const quoteTokenBlanceLP = (await quotedContract.balanceOf(lpAddress)).toString()
          const lpTokenBalanceMC = (await lpContract.balanceOf(getAddress(app.contractInfo.raid))).toString()
          const lpTotalSupply = (await lpContract.totalSupply()).toString()
          const tokenDecimals = await tokenContract.decimals()
          const quoteTokenDecimals = await quotedContract.decimals()

          let tokenAmount
          let lpTotalInQuoteToken
          let tokenPriceVsQuote
          if (farm.isTokenOnly) {
            tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
            if (farm.tokenSymbol === QuoteToken.BUSD && farm.quoteTokenSymbol === QuoteToken.BUSD) {
              tokenPriceVsQuote = new BigNumber(1)
            } else {
              tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
            }
            lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
          } else {
            // Ratio in % a LP tokens that are in staking, vs the total number in circulation
            const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
      
            // Total value in staking in quote token value
            lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
              .div(new BigNumber(10).pow(18))
              .times(new BigNumber(2))
              .times(lpTokenRatio)
      
            // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
            tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
            const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
              .div(new BigNumber(10).pow(quoteTokenDecimals))
              .times(lpTokenRatio)
      
            if (tokenAmount.comparedTo(0) > 0) {
              tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
            } else {
              tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
            }
          }
      
          if (farm.quoteTokenSymbol === QuoteToken.BUSD) {
            const tokenSymbol = farm.tokenSymbol.toLowerCase()
            // log(tokenSymbol, tokenPriceVsQuote.toNumber())orgToken
            app.db.stats.prices[tokenSymbol] = tokenPriceVsQuote.toNumber()
          }

          if (farm.lpSymbol === 'BUSD-BNB LP') {
            app.db.stats.prices.bnb = 1 / tokenPriceVsQuote.toNumber()
            app.db.stats.prices.wbnb = 1 / tokenPriceVsQuote.toNumber()
          }
          

          // log(tokenAmount)
          // log(lpTotalInQuoteToken)
          // log(tokenPriceVsQuote)
          // log(quoteTokenBlanceLP)
          // log(lpTokenBalanceMC)
          // log(lpTotalSupply)
          farm.tokenAmount = tokenAmount.toNumber()
          farm.lpTotalInQuoteToken = lpTotalInQuoteToken.toNumber()
          farm.tokenPriceVsQuote = tokenPriceVsQuote.toNumber()
          farm.tokenBalanceLP = toShort(tokenBalanceLP.toString())
          farm.quoteTokenBlanceLP = toShort(quoteTokenBlanceLP.toString())
          farm.lpTokenBalanceMC = toShort(lpTokenBalanceMC.toString())
          farm.lpTotalSupply = toShort(lpTotalSupply.toString())
          farm.tokenDecimals = tokenDecimals
          farm.quoteTokenDecimals = quoteTokenDecimals
          farm.tokenTotalSupply = toShort((await tokenContract.totalSupply()).toString())
          farm.tokenTotalBurned = toShort((await tokenContract.balanceOf('0x000000000000000000000000000000000000dEaD')).toString())

          // log(farm)

          app.db.farms[farm.lpSymbol] = farm
        } catch(e) {
          log(e)

          // i -= 1
        }
      }


      log("Done updating farms")
    }

    // Update stats
    {
      log('Update stats')

      // Update TVL
      {
        log('Updating TVL')

        app.db.stats.tvl = 0

        for (const tokenSymbol of Object.keys(app.db.farms)) {
          const farm = app.db.farms[tokenSymbol]
          let liquidity = farm.lpTotalInQuoteToken

          if (!farm.lpTotalInQuoteToken) {
            liquidity = 0
          } else {
            liquidity = app.db.stats.prices[farm.quoteTokenSymbol.toLowerCase()] * farm.lpTotalInQuoteToken
          }

          app.db.stats.tvl += liquidity
        }
      }

      // Update historical token prices
      {
        log('Update historical token prices')
        if (!app.db.historical.price) app.db.historical.price = {}

        for (const tokenSymbol in app.db.stats.prices) {
          if (!app.db.historical.price[tokenSymbol]) app.db.historical.price[tokenSymbol] = []

          const currentPrice = app.db.stats.prices[tokenSymbol]
          const historicalPrice = app.db.historical.price[tokenSymbol]

          const oldTime = (new Date(historicalPrice[historicalPrice.length-1]?.[0] || 0)).getTime()
          const newTime = (new Date()).getTime()
          const diff = newTime - oldTime

          if (diff / (1000 * 60 * 60 * 24) > 1) {
            historicalPrice.push([newTime, currentPrice])
          }
        }
      }

      // Update liquidity
      {
        log('Update liquidity')
        if (!app.db.historical.liquidity) app.db.historical.liquidity = {
          total: [],
          busd: [],
          bnb: []
        }

        app.db.stats.totalLiquidity = app.db.stats.totalBusdLiquidity + (app.db.stats.totalBnbLiquidity * app.db.stats.prices.bnb)

        const oldTime = (new Date(app.db.historical.liquidity.total[app.db.historical.liquidity.total.length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          app.db.historical.liquidity.total.push([newTime, app.db.stats.totalLiquidity])
          app.db.historical.liquidity.busd.push([newTime, app.db.stats.totalBusdLiquidity])
          app.db.historical.liquidity.bnb.push([newTime, app.db.stats.totalBnbLiquidity])
        }
      }

      // Update market
      {
        log('Update market')

        app.db.stats.marketItemsAvailable = app.db.trades.filter(t => t.status === 'available').length
        app.db.stats.marketItemsSold = app.db.trades.filter(t => t.status === 'sold').length
        app.db.stats.marketItemsDelisted = app.db.trades.filter(t => t.status === 'delisted').length
        app.db.stats.marketAverageSoldPrice = average(app.db.trades.filter(t => t.status === 'sold').map(t => t.price))
      }

      // Update runes
      {
        log('Update runes')

        app.db.stats.totalRunes = Object.keys(app.db.runes).length - 1
      }

      // Update community
      {
        log('Update community')

        app.db.stats.totalCommunities = 8
        app.db.stats.totalPolls = 50
      }

      // Update game info
      {
        log('Update game info')

        app.db.stats.totalGuilds = app.db.guilds.length
        app.db.stats.totalClasses = Object.keys(app.db.classes).length
        app.db.stats.totalRunewords = 7
      }
      
      // Update stat historical
      {
        log('Update stat historical')

        if (!app.db.historical.stats) app.db.historical.stats = {}

        if (!app.db.historical.stats.totalCharacters) app.db.historical.stats.totalCharacters = []
        if (!app.db.historical.stats.totalItems) app.db.historical.stats.totalItems = []
        if (!app.db.historical.stats.tvl) app.db.historical.stats.tvl = []
        if (!app.db.historical.stats.marketItemsAvailable) app.db.historical.stats.marketItemsAvailable = []
        if (!app.db.historical.stats.marketItemsSold) app.db.historical.stats.marketItemsSold = []
        if (!app.db.historical.stats.marketItemsDelisted) app.db.historical.stats.marketItemsDelisted = []
        if (!app.db.historical.stats.marketAverageSoldPrice) app.db.historical.stats.marketAverageSoldPrice = []
        if (!app.db.historical.stats.totalCommunities) app.db.historical.stats.totalCommunities = []
        if (!app.db.historical.stats.totalClasses) app.db.historical.stats.totalClasses = []
        if (!app.db.historical.stats.totalGuilds) app.db.historical.stats.totalGuilds = []
        if (!app.db.historical.stats.totalPolls) app.db.historical.stats.totalPolls = []
        if (!app.db.historical.stats.totalRunes) app.db.historical.stats.totalRunes = []
        if (!app.db.historical.stats.totalRunewords) app.db.historical.stats.totalRunewords = []

        const oldTime = (new Date(app.db.historical.stats.updatedAt || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          app.db.historical.stats.totalCharacters.push([newTime, app.db.stats.totalCharacters])
          app.db.historical.stats.totalItems.push([newTime, app.db.stats.totalItems])
          app.db.historical.stats.tvl.push([newTime, app.db.stats.tvl])
          app.db.historical.stats.marketItemsAvailable.push([newTime, app.db.stats.marketItemsAvailable])
          app.db.historical.stats.marketItemsSold.push([newTime, app.db.stats.marketItemsSold])
          app.db.historical.stats.marketItemsDelisted.push([newTime, app.db.stats.marketItemsDelisted])
          app.db.historical.stats.marketAverageSoldPrice.push([newTime, app.db.stats.marketAverageSoldPrice])
          app.db.historical.stats.totalCommunities.push([newTime, app.db.stats.totalCommunities])
          app.db.historical.stats.totalClasses.push([newTime, app.db.stats.totalClasses])
          app.db.historical.stats.totalGuilds.push([newTime, app.db.stats.totalGuilds])
          app.db.historical.stats.totalPolls.push([newTime, app.db.stats.totalPolls])
          app.db.historical.stats.totalRunes.push([newTime, app.db.stats.totalRunes])
          app.db.historical.stats.totalRunewords.push([newTime, app.db.stats.totalRunewords])

          app.db.historical.stats.updatedAt = newTime
        }
      }

    }

    // Update app
    {
      log('Update app')
      // Update Profile config
      {
        log('Updating Profile config')

        app.config.characterMintCost = toShort((await app.contracts.characterFactory.tokenPrice()).toString())
        app.config.profileRegisterCost = toShort((await app.contracts.profile.numberRuneToRegister()).toString())
      }

    }

    // Update runes
    {
      log('Update runes')

      for (const tokenSymbol in app.db.stats.prices) {
        if (tokenSymbol === 'bnb' || tokenSymbol === 'usdt' || tokenSymbol === 'busd') continue

        if (!app.db.runes[tokenSymbol]) app.db.runes[tokenSymbol] = {}

        app.db.runes[tokenSymbol].price = app.db.stats.prices[tokenSymbol]
      }
      
      for (const tokenSymbol of Object.keys(app.db.farms)) {
        try {
          const farm = app.db.farms[tokenSymbol]

          if (farm.isTokenOnly) {
            const symbol = tokenSymbol.toLowerCase()

            const tokenContract = new ethers.Contract(getAddress(app.contractInfo[symbol]), app.contractMetadata.BEP20.abi, app.signers.read)

            const raidHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.raid))).toString())
            const botHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.botAddress))).toString())
            const bot2Holdings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.bot2Address))).toString())
            const bot3Holdings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.bot3Address))).toString())
            const vaultHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.vaultAddress))).toString())
            const vault2Holdings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.vault2Address))).toString())
            const vault3Holdings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.vault3Address))).toString())
            const devHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.devAddress))).toString())
            const charityHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.charityAddress))).toString())
            const deployerHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.deployerAddress))).toString())
            const characterFactoryHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.characterFactory))).toString())
            const lockedLiquidityHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.lockedLiquidityAddress))).toString()) * 0.61
            const v2LiquidityHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.v2LiquidityAddress))).toString()) * 0.99
            const evolutionHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.evolutionAddress))).toString())
            // const cashHoldings = toShort((await tokenContract.balanceOf(getAddress(app.contractInfo.cashAddress))).toString())
            const vaultTotalHoldings = vaultHoldings + vault2Holdings + vault3Holdings
            const botTotalHoldings = botHoldings + bot2Holdings + bot3Holdings
            const orgCashHoldings = 0
            const orgTokenHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + lockedLiquidityHoldings + evolutionHoldings
            const orgHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + evolutionHoldings

            const totalSupply = farm.tokenTotalSupply
            const circulatingSupply = farm.tokenTotalSupply - farm.tokenTotalBurned
            const totalBurned = farm.tokenTotalBurned

            if (!app.db.runes[symbol]) app.db.runes[symbol] = {}

            app.db.runes[symbol].totalSupply = totalSupply
            app.db.runes[symbol].circulatingSupply = circulatingSupply
            app.db.runes[symbol].totalBurned = totalBurned
            app.db.runes[symbol].holders = {}
            app.db.runes[symbol].holders.raid = raidHoldings
            app.db.runes[symbol].holders.vault = vaultHoldings
            app.db.runes[symbol].holders.vault2 = vault2Holdings
            app.db.runes[symbol].holders.vault3 = vault3Holdings
            app.db.runes[symbol].holders.vaultTotal = vaultTotalHoldings
            app.db.runes[symbol].holders.characterFactory = characterFactoryHoldings
            app.db.runes[symbol].holders.dev = devHoldings
            app.db.runes[symbol].holders.charity = charityHoldings
            app.db.runes[symbol].holders.deployer = deployerHoldings
            app.db.runes[symbol].holders.bot = botHoldings
            app.db.runes[symbol].holders.bot2 = bot2Holdings
            app.db.runes[symbol].holders.bot3 = bot3Holdings
            app.db.runes[symbol].holders.botTotal = botTotalHoldings
            app.db.runes[symbol].holders.lockedLiquidity = lockedLiquidityHoldings
            app.db.runes[symbol].holders.v2Liquidity = v2LiquidityHoldings
            app.db.runes[symbol].holders.orgCash = orgCashHoldings
            app.db.runes[symbol].holders.orgToken = orgTokenHoldings
            app.db.runes[symbol].holders.org = orgHoldings
            app.db.runes[symbol].holders.evolution = evolutionHoldings

            if (!app.db.historical.totalSupply) app.db.historical.totalSupply = {}
            if (!app.db.historical.totalSupply[symbol]) app.db.historical.totalSupply[symbol] = []
            if (!app.db.historical.circulatingSupply) app.db.historical.circulatingSupply = {}
            if (!app.db.historical.circulatingSupply[symbol]) app.db.historical.circulatingSupply[symbol] = []
            if (!app.db.historical.totalBurned) app.db.historical.totalBurned = {}
            if (!app.db.historical.totalBurned[symbol]) app.db.historical.totalBurned[symbol] = []
            if (!app.db.historical.raid) app.db.historical.raid = {}
            if (!app.db.historical.raid.holdings) app.db.historical.raid.holdings = {}
            if (!app.db.historical.raid.holdings[symbol]) app.db.historical.raid.holdings[symbol] = []
            if (!app.db.historical.bot) app.db.historical.bot = {}
            if (!app.db.historical.bot.holdings) app.db.historical.bot.holdings = {}
            if (!app.db.historical.bot.holdings[symbol]) app.db.historical.bot.holdings[symbol] = []
            if (!app.db.historical.bot2) app.db.historical.bot2 = {}
            if (!app.db.historical.bot2.holdings) app.db.historical.bot2.holdings = {}
            if (!app.db.historical.bot2.holdings[symbol]) app.db.historical.bot2.holdings[symbol] = []
            if (!app.db.historical.bot3) app.db.historical.bot3 = {}
            if (!app.db.historical.bot3.holdings) app.db.historical.bot3.holdings = {}
            if (!app.db.historical.bot3.holdings[symbol]) app.db.historical.bot3.holdings[symbol] = []
            if (!app.db.historical.botTotal) app.db.historical.botTotal = {}
            if (!app.db.historical.botTotal.holdings) app.db.historical.botTotal.holdings = {}
            if (!app.db.historical.botTotal.holdings[symbol]) app.db.historical.botTotal.holdings[symbol] = []
            if (!app.db.historical.vault) app.db.historical.vault = {}
            if (!app.db.historical.vault.holdings) app.db.historical.vault.holdings = {}
            if (!app.db.historical.vault.holdings[symbol]) app.db.historical.vault.holdings[symbol] = []
            if (!app.db.historical.vault2) app.db.historical.vault2 = {}
            if (!app.db.historical.vault2.holdings) app.db.historical.vault2.holdings = {}
            if (!app.db.historical.vault2.holdings[symbol]) app.db.historical.vault2.holdings[symbol] = []
            if (!app.db.historical.vault3) app.db.historical.vault3 = {}
            if (!app.db.historical.vault3.holdings) app.db.historical.vault3.holdings = {}
            if (!app.db.historical.vault3.holdings[symbol]) app.db.historical.vault3.holdings[symbol] = []
            if (!app.db.historical.vaultTotal) app.db.historical.vaultTotal = {}
            if (!app.db.historical.vaultTotal.holdings) app.db.historical.vaultTotal.holdings = {}
            if (!app.db.historical.vaultTotal.holdings[symbol]) app.db.historical.vaultTotal.holdings[symbol] = []
            if (!app.db.historical.characterFactory) app.db.historical.characterFactory = {}
            if (!app.db.historical.characterFactory.holdings) app.db.historical.characterFactory.holdings = {}
            if (!app.db.historical.characterFactory.holdings[symbol]) app.db.historical.characterFactory.holdings[symbol] = []
            if (!app.db.historical.dev) app.db.historical.dev = {}
            if (!app.db.historical.dev.holdings) app.db.historical.dev.holdings = {}
            if (!app.db.historical.dev.holdings[symbol]) app.db.historical.dev.holdings[symbol] = []
            if (!app.db.historical.charity) app.db.historical.charity = {}
            if (!app.db.historical.charity.holdings) app.db.historical.charity.holdings = {}
            if (!app.db.historical.charity.holdings[symbol]) app.db.historical.charity.holdings[symbol] = []
            if (!app.db.historical.deployer) app.db.historical.deployer = {}
            if (!app.db.historical.deployer.holdings) app.db.historical.deployer.holdings = {}
            if (!app.db.historical.deployer.holdings[symbol]) app.db.historical.deployer.holdings[symbol] = []
            if (!app.db.historical.lockedLiquidity) app.db.historical.lockedLiquidity = {}
            if (!app.db.historical.lockedLiquidity.holdings) app.db.historical.lockedLiquidity.holdings = {}
            if (!app.db.historical.lockedLiquidity.holdings[symbol]) app.db.historical.lockedLiquidity.holdings[symbol] = []
            if (!app.db.historical.v2Liquidity) app.db.historical.v2Liquidity = {}
            if (!app.db.historical.v2Liquidity.holdings) app.db.historical.v2Liquidity.holdings = {}
            if (!app.db.historical.v2Liquidity.holdings[symbol]) app.db.historical.v2Liquidity.holdings[symbol] = []
            if (!app.db.historical.org) app.db.historical.org = {}
            if (!app.db.historical.org.holdings) app.db.historical.org.holdings = {}
            if (!app.db.historical.org.holdings[symbol]) app.db.historical.org.holdings[symbol] = []
            if (!app.db.historical.orgCash) app.db.historical.orgCash = {}
            if (!app.db.historical.orgCash.holdings) app.db.historical.orgCash.holdings = {}
            if (!app.db.historical.orgCash.holdings[symbol]) app.db.historical.orgCash.holdings[symbol] = []
            if (!app.db.historical.orgToken) app.db.historical.orgToken = {}
            if (!app.db.historical.orgToken.holdings) app.db.historical.orgToken.holdings = {}
            if (!app.db.historical.orgToken.holdings[symbol]) app.db.historical.orgToken.holdings[symbol] = []
            if (!app.db.historical.evolution) app.db.historical.evolution = {}
            if (!app.db.historical.evolution.holdings) app.db.historical.evolution.holdings = {}
            if (!app.db.historical.evolution.holdings[symbol]) app.db.historical.evolution.holdings[symbol] = []

            const oldTime = (new Date(app.db.historical.totalSupply[symbol][app.db.historical.totalSupply[symbol].length-1]?.[0] || 0)).getTime()
            const newTime = (new Date()).getTime()
            const diff = newTime - oldTime

            if (diff / (1000 * 60 * 60 * 24) > 1) {
              app.db.historical.totalSupply[symbol].push([newTime, totalSupply])
              app.db.historical.circulatingSupply[symbol].push([newTime, circulatingSupply])
              app.db.historical.totalBurned[symbol].push([newTime, totalBurned])
              app.db.historical.raid.holdings[symbol].push([newTime, raidHoldings])
              app.db.historical.bot.holdings[symbol].push([newTime, botHoldings])
              app.db.historical.bot2.holdings[symbol].push([newTime, bot2Holdings])
              app.db.historical.bot3.holdings[symbol].push([newTime, bot3Holdings])
              app.db.historical.botTotal.holdings[symbol].push([newTime, botTotalHoldings])
              app.db.historical.vault.holdings[symbol].push([newTime, vaultHoldings])
              app.db.historical.vault2.holdings[symbol].push([newTime, vault2Holdings])
              app.db.historical.vault3.holdings[symbol].push([newTime, vault3Holdings])
              app.db.historical.vaultTotal.holdings[symbol].push([newTime, vaultTotalHoldings])
              app.db.historical.characterFactory.holdings[symbol].push([newTime, characterFactoryHoldings])
              app.db.historical.dev.holdings[symbol].push([newTime, devHoldings])
              app.db.historical.charity.holdings[symbol].push([newTime, charityHoldings])
              app.db.historical.deployer.holdings[symbol].push([newTime, deployerHoldings])
              app.db.historical.lockedLiquidity.holdings[symbol].push([newTime, lockedLiquidityHoldings])
              app.db.historical.v2Liquidity.holdings[symbol].push([newTime, v2LiquidityHoldings])
              app.db.historical.org.holdings[symbol].push([newTime, orgHoldings])
              app.db.historical.orgCash.holdings[symbol].push([newTime, orgCashHoldings])
              app.db.historical.orgToken.holdings[symbol].push([newTime, orgTokenHoldings])
              app.db.historical.evolution.holdings[symbol].push([newTime, evolutionHoldings])
            }
          }
        } catch(e) {
          log(e)
        }
      }
    
      app.db.runes.totals = {}
      app.db.runes.totals.raid = 0
      app.db.runes.totals.vault = 0
      app.db.runes.totals.vault2 = 0
      app.db.runes.totals.vault3 = 0
      app.db.runes.totals.vaultTotal = 0
      app.db.runes.totals.characterFactory = 0
      app.db.runes.totals.dev = 0
      app.db.runes.totals.charity = 0
      app.db.runes.totals.deployer = 0
      app.db.runes.totals.bot = 0
      app.db.runes.totals.bot2 = 0
      app.db.runes.totals.bot3 = 0
      app.db.runes.totals.botTotal = 0
      app.db.runes.totals.lockedLiquidity = 0
      app.db.runes.totals.v2Liquidity = 0
      app.db.runes.totals.org = 0
      app.db.runes.totals.orgCash = 0
      app.db.runes.totals.orgToken = 0
      app.db.runes.totals.evolution = 0

      for (const rune of Object.keys(app.db.runes)) {
        // if (rune === 'totals') continue
        if (app.db.runes[rune].holders) {
          app.db.runes.totals.raid += app.db.runes[rune].holders.raid * app.db.runes[rune].price
          app.db.runes.totals.vault += app.db.runes[rune].holders.vault * app.db.runes[rune].price
          app.db.runes.totals.vault2 += app.db.runes[rune].holders.vault2 * app.db.runes[rune].price
          app.db.runes.totals.vault3 += app.db.runes[rune].holders.vault3 * app.db.runes[rune].price
          app.db.runes.totals.vaultTotal += app.db.runes[rune].holders.vaultTotal * app.db.runes[rune].price
          app.db.runes.totals.characterFactory += app.db.runes[rune].holders.characterFactory * app.db.runes[rune].price
          app.db.runes.totals.dev += app.db.runes[rune].holders.dev * app.db.runes[rune].price
          app.db.runes.totals.charity += app.db.runes[rune].holders.charity * app.db.runes[rune].price
          app.db.runes.totals.deployer += app.db.runes[rune].holders.deployer * app.db.runes[rune].price
          app.db.runes.totals.bot += app.db.runes[rune].holders.bot * app.db.runes[rune].price
          app.db.runes.totals.bot2 += app.db.runes[rune].holders.bot2 * app.db.runes[rune].price
          app.db.runes.totals.bot3 += app.db.runes[rune].holders.bot3 * app.db.runes[rune].price
          app.db.runes.totals.botTotal += app.db.runes[rune].holders.botTotal * app.db.runes[rune].price
          app.db.runes.totals.lockedLiquidity += app.db.runes[rune].holders.lockedLiquidity * app.db.runes[rune].price
          app.db.runes.totals.v2Liquidity += app.db.runes[rune].holders.v2Liquidity * app.db.runes[rune].price
          app.db.runes.totals.org += app.db.runes[rune].holders.org * app.db.runes[rune].price
          app.db.runes.totals.orgToken += app.db.runes[rune].holders.orgToken * app.db.runes[rune].price
          app.db.runes.totals.orgCash += app.db.runes[rune].holders.orgCash

          // if (rune === 'BUSD' || rune === 'USDT' || rune === 'USDC') {
          // }
        }
      }

      if (!app.db.historical.total) app.db.historical.total = {}
      if (!app.db.historical.total.totals) app.db.historical.total.totals = {}


      for (const symbol of Object.keys(app.db.runes.totals)) {
        if (!app.db.historical.total.totals[symbol]) app.db.historical.total.totals[symbol] = []

        const oldTime = (new Date(app.db.historical.total.totals[symbol][app.db.historical.total.totals[symbol].length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          app.db.historical.total.totals[symbol].push([newTime, app.db.runes.totals[symbol]])
        }
      }
    }
    
    // await saveConfig()

    setTimeout(() => monitorGeneralStats(app), 30 * 60 * 1000)
  } catch (e) {
    log(e)
  }
}
