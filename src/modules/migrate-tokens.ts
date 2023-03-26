
export async function migrateTokens(app) {
  for (const itemData of app.db.items) {
    const item = await app.db.loadItem(itemData.id)

    item.tokens = item.tokens.map(t => t.id)

    await app.db.saveItem(item)
  }
}