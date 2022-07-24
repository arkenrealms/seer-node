import fetch from 'node-fetch'
import path from 'path'
import jetpack, { find } from 'fs-jetpack'
import beautify from 'json-beautify'

const shortId = require('shortid')

async function add(type, data) {
  console.log('Update notices')

  const now = new Date().getTime() / 1000
  const notices = (jetpack.read(path.resolve('./db/notices.json'), 'json') || []).filter(n => n.createdAt > now - (7 * 24 * 60 * 60))

  if (notices.find(n => n.type === type && JSON.stringify(n.data) === JSON.stringify(data))) return // already exists

  notices.push({
    id: shortId(),
    type,
    data,
    createdAt: now
  })

  jetpack.write(path.resolve(`./db/notices.json`), beautify(notices, null, 2), { atomic: true })
}

export async function initNotices(app) {
  // Update coordinator refers
  try {
    app.notices = {
      add,
    }
  } catch(e) {
    console.log('Error', e)
  }
}
