export async function monitorItemEvents(app) {
  app.contracts.arcaneItems.on('Transfer', async () => {
    await app.modules.getAllItemEvents(app)
  })
}
