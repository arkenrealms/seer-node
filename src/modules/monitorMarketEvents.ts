import { log } from '../util'

export async function monitorMarketEvents(app) {
  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    app.contracts.arcaneTrader.on('List', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.arcaneTrader.on('Update', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.arcaneTrader.on('Delist', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.arcaneTrader.on('Buy', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })
  } catch(e) {
    log(e)
  }
}
