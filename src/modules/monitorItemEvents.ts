export async function monitorItemEvents(app) {
  app.contracts.items.on('Transfer', async () => {
    await app.modules.getAllItemEvents(app)
  })
}
