import fetch from 'node-fetch'
import path from 'path'
import jetpack from 'fs-jetpack'
import beautify from 'json-beautify'

export async function monitorCoordinator(app) {
  // Update coordinator refers
  try {
    console.log('Update coordinator refers')
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`http://35.245.242.215/data/refers.json?${rand}`)

    const data = await response.json()

    jetpack.write(path.resolve(`./db/affiliate/refers.json`), beautify(data, null, 2), { atomic: true })
  } catch(e) {
    console.log(e)
  }

  setTimeout(() => monitorCoordinator(app), 2 * 60 * 1000)
}
