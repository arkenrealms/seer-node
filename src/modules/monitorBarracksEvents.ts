export async function monitorBarracksEvents(app) {
  app.contracts.barracks.on('Equip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('Unequip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionBurn', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionBonus', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionHiddenPool', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionFee', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionSwap', async () => {
    await app.modules.getAllBarracksEvents(app)
  })
}
