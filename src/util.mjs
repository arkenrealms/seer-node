import { exec } from 'child_process'
import ethers from 'ethers'
import util from 'util'

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
      const k = item.seller + item.tokenId;
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  })
}

export const toLong = (x) => ethers.utils.parseEther(x + '')
export const toShort = (x) => round(parseFloat(ethers.utils.formatEther(x)), 4)

export const getAddress = (address) => {
  const mainNetChainId = 56
  const chainId = process.env.REACT_APP_CHAIN_ID
  return address[chainId] ? address[chainId] : address[mainNetChainId]
}

export async function updateGit() {
  try {
    const execPromise = util.promisify(exec)
  
    const { err, stdout, stderr } = await execPromise('cd db && git add -A && git commit -m "build: Binzy doz it" && git push --set-upstream origin master')
  
    console.log(err, stderr, stdout)
  
    await wait(100)
  } catch(e) {
    
  }
}
