import { exec } from 'child_process'
import jetpack from 'fs-jetpack'
import ethers from 'ethers'
import util from 'util'

const path = require('path')

export const isDebug = process.env.HOME === '/Users/dev' || process.env.HOME === '/home/dev' || process.env.HOME === '/home/dev'

export function logError(...msgs) {
  console.log("[DB]", ...msgs)

  const errorLog = jetpack.read(path.resolve('./public/data/errors.json'), 'json') || []

  for (const msg of msgs) {
    errorLog.push(JSON.stringify(msg))
  }
  
  jetpack.write(path.resolve('./public/data/errors.json'), JSON.stringify(errorLog, null, 2), { atomic: true })
}

export function log(...msgs) {
  const logData = jetpack.read(path.resolve('../public/data/log.json'), 'json') || []
  
  for (const msg of msgs) {
    logData.push(JSON.stringify(msg))
  }

  if (isDebug) {
    console.log('[DB]', ...msgs)
  }

  jetpack.write(path.resolve('./public/data/log.json'), JSON.stringify(logData, null, 2))
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function round(num, precision) {
  const _precision = 10 ** precision
  return Math.ceil(num * _precision) / _precision
}

export function removeDupes(list) {
  const seen = {};
  return list.filter(function(item) {
      const k1 = item.seller + item.tokenId + item.blockNumber;
      const k2 = item.id;
      const exists = seen.hasOwnProperty(k1) || seen.hasOwnProperty(k2)

      if (!exists) {
        seen[k1] = true
        seen[k2] = true
      }

      return !exists
  })
}

export const toLong = (x) => ethers.utils.parseEther(x + '')
export const toShort = (x) => round(parseFloat(ethers.utils.formatEther(x)), 4)

let updatingGit = false

export async function updateGit() {
  if (updatingGit) return

  updatingGit = true
  try {
    const execPromise = util.promisify(exec)
    
    try {
      await execPromise('rm ./db/.git/index.lock')
    } catch(e2) {

    }

    const { stdout, stderr } = await execPromise('cd db && git add -A && git commit -m "build: Binzy doz it" && git push --set-upstream origin master')
  
    console.log(stderr, stdout)
  
    await wait(100)
  } catch(e) {
    console.log(e)
  }
  updatingGit = false
}

export function groupBySub(xs, key, subkey) {
  return xs.reduce(function(rv, x) {
      if (!x[key][subkey]) return rv;
      (rv[x[key][subkey]] = rv[x[key][subkey]] || []).push(x);
      return rv;
  }, {}) || null
}

export function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
      if (!x[key]) return rv;
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
  }, {}) || null
}


export function getHighestId(arr) {
  let highest = 0

  for (const item of arr) {
    if (item.id > highest) {
      highest = item.id
    }
  }

  return highest
}

export function average(arr) { return arr.reduce((p, c) => p + c, 0) / arr.length }
export function ordinalise(n) { return n+(n%10==1&&n%100!=11?'st':n%10==2&&n%100!=12?'nd':n%10==3&&n%100!=13?'rd':'th') }
export function commarise(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

