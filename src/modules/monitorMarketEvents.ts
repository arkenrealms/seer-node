import { log } from '../util'

export async function monitorMarketEvents(app) {
  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    app.contracts.trader.on('List', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.trader.on('Update', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.trader.on('Delist', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log(e)
      }
    })

    app.contracts.trader.on('Buy', async () => {
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
