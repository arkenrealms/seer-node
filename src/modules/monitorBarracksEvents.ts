export async function monitorBarracksEvents(app) {
  app.contracts.arcaneBarracks.on('Equip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('Unequip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('ActionBurn', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('ActionBonus', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('ActionHiddenPool', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('ActionFee', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.arcaneBarracks.on('ActionSwap', async () => {
    await app.modules.getAllBarracksEvents(app)
  })
}
