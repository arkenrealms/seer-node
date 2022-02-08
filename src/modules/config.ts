import jetpack from 'fs-jetpack'
import path from 'path'

export function initConfig(app) {
  app.config = jetpack.read(path.resolve('./db/config.json'), 'json')
  app.config.trades.updating = false
  app.config.barracks.updating = false
  app.config.blacksmith.updating = false
  app.config.items.updating = false
  app.config.characters.updating = false
  app.config.test.updating = false

  if (!app.config.sender) {
    app.config.sender = {
      updating: false,
      lastBlock: {}
    }
  }
}