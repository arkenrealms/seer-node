import {
  getHighestId,
  toShort,
  log,
  random,
  sha256,
} from "@rune-backend-sdk/util";
import {decodeItem} from "@rune-backend-sdk/util/item-decoder";
import {isValidRequest, getSignedRequest} from "@rune-backend-sdk/util/web3";
import getAddressByUsername from "@rune-backend-sdk/util/api/getAddressByOldUsername";
import shortId from "shortid";

const items = {
  zavox: {
    name: "Zavox's Fortune",
    rarity: "Normal",
  },
  guardian: {
    name: "Guardian Egg",
    rarity: "Magical",
  },
  cube: {
    name: `Early Access Founder's Cube`,
    rarity: "Unique",
  },
  trinket: {
    name: "Trinket",
    rarity: "Magical",
  },
};

const features = {
  "expert-mode": 10000,
};

async function getUserStakedTokens(address) {
  const staked = 0;

  return staked;
}

export async function initLive(app) {
  app.api.on("CS_SiteQuestRequest", async function (req, res) {
    log("CS_SiteQuestRequest", req);

    try {
    } catch (e) {
      log("Error: ", e);
      res("CS_SiteQuestResponse", {
        id: req?.id,
        data: {status: 0, message: "Invalid signature"},
      });
    }
  });

  app.api.on("CS_ClaimSkinRequest", async function (req, res) {
    log("CS_ClaimSkinRequest", req);

    try {
      const tokenId = req.data.tokenId;
      const ownerAddress = await app.contracts.items.ownerOf(tokenId);

      if (
        !(await isValidRequest(app.web3, req)) ||
        req.signature.address !== ownerAddress
      ) {
        res("CS_ClaimSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid signature"},
        });
        return;
      }

      if (app.db.tokenSkins[tokenId] !== undefined) {
        res("CS_ClaimSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Already claimed"},
        });
        return;
      }

      const item = decodeItem(tokenId);

      if (!app.db?.skins?.[item.id]?.[item.rarity.name.toLowerCase()]) {
        res("CS_ClaimSkinResponse", {
          id: req.id,
          data: {status: 0, message: "No skins exist yet"},
        });
        return;
      }

      let skin;
      let rarity = item.rarity.name;

      if (item.name === "Guiding Light") {
        if (rarity === "Rare") {
          rarity = "Mythic";
        } else if (rarity === "Magical") {
          rarity = "Rare";
        }
      }

      if (
        ["Legendary", "Unique", "Mythic"].includes(rarity) &&
        app.db.skins[item.id].mythic.length > 0
      ) {
        skin =
          app.db.skins[item.id].mythic[
            random(0, app.db.skins[item.id].mythic.length - 1)
          ];
        app.db.skins[item.id].mythic = app.db.skins[item.id].mythic.filter(
          (s) => s !== skin
        );
      } else if (
        ["Legendary", "Unique", "Mythic", "Epic"].includes(rarity) &&
        app.db.skins[item.id].epic.length > 0
      ) {
        skin =
          app.db.skins[item.id].epic[
            random(0, app.db.skins[item.id].epic.length - 1)
          ];
        app.db.skins[item.id].epic = app.db.skins[item.id].epic.filter(
          (s) => s !== skin
        );
      } else if (
        ["Legendary", "Unique", "Mythic", "Epic", "Rare"].includes(rarity) &&
        app.db.skins[item.id].rare.length > 0
      ) {
        skin =
          app.db.skins[item.id].rare[
            random(0, app.db.skins[item.id].rare.length - 1)
          ];
        app.db.skins[item.id].rare = app.db.skins[item.id].rare.filter(
          (s) => s !== skin
        );
      } else if (
        ["Legendary", "Unique", "Mythic", "Epic", "Rare", "Magical"].includes(
          rarity
        ) &&
        app.db.skins[item.id].magical.length > 0
      ) {
        skin =
          app.db.skins[item.id].magical[
            random(0, app.db.skins[item.id].magical.length - 1)
          ];
        app.db.skins[item.id].magical = app.db.skins[item.id].magical.filter(
          (s) => s !== skin
        );
      }

      app.db.tokenSkins[tokenId] = skin;

      const token = await app.db.loadToken(tokenId);

      if (!token.defaultImage) token.defaultImage = token.image;

      token.image = `https://cache.rune.game/${skin}`;

      app.db.queueSave(() => app.db.saveSkins());
      app.db.queueSave(() => app.db.saveTokenSkins());
      app.db.queueSave(() => app.db.saveToken(token));

      res("CS_ClaimSkinResponse", {
        id: req?.id,
        data: {status: 1},
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_ClaimSkinResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_DetachSkinRequest", async function (req, res) {
    log("CS_DetachSkinRequest", req);

    try {
      const tokenId = req.data.tokenId;
      const ownerAddress = await app.contracts.items.ownerOf(tokenId);

      if (
        !(await isValidRequest(app.web3, req)) ||
        req.signature.address !== ownerAddress
      ) {
        res("CS_DetachSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid signature"},
        });
        return;
      }

      if (!app.db.tokenSkins[tokenId]) {
        res("CS_DetachSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Already detached"},
        });
        return;
      }

      const item = decodeItem(tokenId);

      if (!app.db.userSkins[ownerAddress]) app.db.userSkins[ownerAddress] = {};
      if (!app.db.userSkins[ownerAddress][item.id])
        app.db.userSkins[ownerAddress][item.id] = [];

      app.db.userSkins[ownerAddress][item.id].push(app.db.tokenSkins[tokenId]);

      app.db.tokenSkins[tokenId] = null;

      const token = await app.db.loadToken(tokenId);

      token.image = token.defaultImage;

      app.db.queueSave(() => app.db.saveSkins());
      app.db.queueSave(() => app.db.saveTokenSkins());
      app.db.queueSave(() => app.db.saveUserSkins());
      app.db.queueSave(() => app.db.saveToken(token));

      res("CS_DetachSkinResponse", {
        id: req?.id,
        data: {status: 1},
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_DetachSkinResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_AttachSkinRequest", async function (req, res) {
    log("CS_AttachSkinRequest", req);

    try {
      const tokenId = req.data.tokenId;
      const skin = req.data.skin;
      const ownerAddress = await app.contracts.items.ownerOf(tokenId);

      if (
        !(await isValidRequest(app.web3, req)) ||
        req.signature.address !== ownerAddress
      ) {
        res("CS_AttachSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid signature"},
        });
        return;
      }

      if (app.db.tokenSkins[tokenId] || !skin) {
        res("CS_AttachSkinResponse", {
          id: req.id,
          data: {status: 0, message: "Already attached"},
        });
        return;
      }

      const item = decodeItem(tokenId);

      if (!app.db.userSkins[ownerAddress]) app.db.userSkins[ownerAddress] = {};
      if (!app.db.userSkins[ownerAddress][item.id])
        app.db.userSkins[ownerAddress][item.id] = [];

      app.db.userSkins[ownerAddress][item.id] = app.db.userSkins[ownerAddress][
        item.id
      ].filter((s) => s !== skin);

      app.db.tokenSkins[tokenId] = skin;

      const token = await app.db.loadToken(tokenId);

      token.image = `https://cache.rune.game/${skin}`;

      app.db.queueSave(() => app.db.saveSkins());
      app.db.queueSave(() => app.db.saveTokenSkins());
      app.db.queueSave(() => app.db.saveUserSkins());
      app.db.queueSave(() => app.db.saveToken(token));

      res("CS_AttachSkinResponse", {
        id: req?.id,
        data: {status: 1},
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_AttachSkinResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_GetUserSkinsRequest", async function (req, res) {
    log("CS_GetUserSkinsRequest", req);

    try {
      res("CS_GetUserSkinsResponse", {
        id: req.id,
        data: {status: 1, data: app.db.userSkins?.[req.data.address] || {}},
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_GetUserSkinsResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_GetTokenSkinsRequest", async function (req, res) {
    log("CS_GetTokenSkinsRequest", req);

    try {
      res("CS_GetTokenSkinsResponse", {
        id: req.id,
        data: {status: 1, data: app.db.tokenSkins},
      });
    } catch (e) {
      res("CS_GetTokenSkinsResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_SaveNoteRequest", async function (req, res) {
    log("CS_SaveNoteRequest", req);

    try {
      if (!(await isValidRequest(app.web3, req))) {
        res("CS_SaveNoteResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid signature"},
        });
        return;
      }

      const tokenId = req.data.tokenId;
      const note = req.data.note;
      const address = req.signature.address;

      const userNotes = await app.db.loadUserNotes(address);

      userNotes[tokenId] = note;

      app.db.queueSave(() => app.db.saveUserNotes(address, userNotes));

      res("CS_SaveNoteResponse", {
        id: req?.id,
        data: {status: 1},
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_SaveNoteResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_GetUserNotesRequest", async function (req, res) {
    log("CS_GetUserNotesRequest", req);

    try {
      res("CS_GetUserNotesResponse", {
        id: req.id,
        data: {
          status: 1,
          data: (await app.db.loadUserNotes(req.data.address)) || {},
        },
      });
    } catch (e) {
      log("Error: ", e);
      res("CS_GetUserNotesResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_CompareUsersRequest", async function (req, res) {
    log("CS_CompareUsersRequest", req);

    try {
      const {address1, address2} = req.data;

      if (
        !(await isValidRequest(app.web3, req)) ||
        !app.admins[req.signature.address]?.permissions.evolution
      ) {
        res("CS_CompareUsersResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid user"},
        });
        return;
      }

      const user1 = await app.db.loadUser(address1);
      const user2 = await app.db.loadUser(address2);

      const hashes1 = user1.evolution?.hashes || [];
      const hashes2 = user2.evolution?.hashes || [];

      const networkMatches = hashes1.filter((hash) => hashes2.includes(hash));

      res("CS_CompareUsersResponse", {
        id: req.id,
        data: {status: 1, networkMatchCount: networkMatches.length},
      });
    } catch (e) {
      log("CS_CompareUsersRequest error", e);
      res("CS_CompareUsersResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_DistributeTokensRequest", async function (req, res) {
    log("CS_DistributeTokensRequest", req);

    try {
      const {usernames, amounts, reason} = req.data;

      if (
        !(await isValidRequest(app.web3, req)) ||
        !app.admins[req.signature.address]?.permissions.distributeReward
      ) {
        res("CS_DistributeTokensResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid user"},
        });
        return;
      }

      const admin = await app.db.loadUser(req.signature.address);

      const amounts2 = amounts.split(",");
      const usernames2 = usernames.split(",");

      for (const index in usernames2) {
        const username = usernames2[index];
        const address = username.trim().startsWith("0x")
          ? username.trim()
          : await getAddressByUsername(username.trim());

        const user = await app.db.loadUser(address);

        for (const index2 in amounts2) {
          if (amounts2[index2].split("=").length !== 2) continue;

          const token = amounts2[index2].split("=")[0].toLowerCase().trim();
          const amount = parseFloat(amounts2[index2].split("=")[1].trim());

          const tokens = [
            "rune",
            "usd",
            "rxs",
            "el",
            "eld",
            "tir",
            "nef",
            "ith",
            "tal",
            "ral",
            "ort",
            "thul",
            "amn",
            "sol",
            "shael",
            "dol",
            "hel",
            "io",
            "lum",
            "ko",
            "fal",
            "lem",
            "pul",
            "um",
            "mal",
            "ist",
            "gul",
            "vex",
            "ohm",
            "lo",
            "sur",
            "ber",
            "jah",
            "cham",
            "zod",
          ];

          if (!tokens.includes(token)) {
            const item = items[token];

            if (!item) continue;

            user.rewards.items[shortId()] = {
              name: item.name,
              rarity: item.rarity,
              quantity: parseInt(amount + ""),
            };

            continue;
          }

          if (!user.rewards.runes[token]) user.rewards.runes[token] = 0;

          user.rewards.runes[token] += amount;
        }

        await app.db.saveUser(user);
      }

      await app.live.emitAll("PlayerAction", {
        key: "admin",
        createdAt: new Date().getTime() / 1000,
        address: req.signature.address,
        message: `${admin.username} distributed ${amounts} to ${usernames} (${reason})`,
      });

      res("CS_DistributeTokensResponse", {
        id: req.id,
        data: {status: 1},
      });
    } catch (e) {
      log("CS_DistributeTokensRequest error", e);
      res("CS_DistributeTokensResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_AddAchievementRequest", async function (req, res) {
    log("CS_AddAchievementRequest", req);

    try {
      const {usernames, achievements, reason} = req.data;

      if (
        !(await isValidRequest(app.web3, req)) ||
        !app.admins[req.signature.address]?.permissions.distributeAchievement
      ) {
        res("CS_AddAchievementResponse", {
          id: req.id,
          data: {status: 0, message: "Invalid user"},
        });
        return;
      }

      const admin = await app.db.loadUser(req.signature.address);

      const achievements2 = achievements.split(",");
      const usernames2 = usernames.split(",");

      for (const index in usernames2) {
        const username = usernames2[index];
        const address = username.trim().startsWith("0x")
          ? username.trim()
          : await getAddressByUsername(username.trim());

        const user = await app.db.loadUser(address);

        for (const index2 in achievements2) {
          const achievement = achievements2[index2].split("=")[0].toUpperCase();
          const amount = parseFloat(achievements2[index2].split("=")[1]);

          app.db.addUserAchievement(user, achievement, amount);
        }

        await app.db.saveUser(user);
      }

      await app.live.emitAll("PlayerAction", {
        key: "admin",
        createdAt: new Date().getTime() / 1000,
        address: req.signature.address,
        message: `${admin.username} added ${achievements} to ${usernames} (${reason})`,
      });

      res("CS_AddAchievementResponse", {
        id: req.id,
        data: {status: 1},
      });
    } catch (e) {
      log("CS_AddAchievementRequest error");
      res("CS_AddAchievementResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_UnlockPremiumFeatureRequest", async function (req, res) {
    log("CS_UnlockPremiumFeatureRequest", req);

    try {
      const {address} = req.data;

      const staked = await getUserStakedTokens(address);
      const user = await app.db.loadUser(address);

      if (staked < user.locked + user.unlocked) {
        // reset
        user.premium.locked = 0;
        user.premium.unlocked = staked;
        user.premium.features = [];
      } else {
        user.premium.unlocked = staked - user.premium.locked;
      }

      if (user.premium.features.includes(req.data.key)) {
        user.premium.features = user.premium.features.filter(
          (f) => f !== req.data.key
        );
        user.premium.locked -= features[req.data.key];
        user.premium.unlocked += features[req.data.key];
      }

      await app.db.saveUser(user);

      res("CS_UnlockPremiumFeatureResponse", {
        id: req.id,
        data: {status: 1},
      });
    } catch (e) {
      log("CS_UnlockPremiumFeatureRequest error");
      res("CS_UnlockPremiumFeatureResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_LockPremiumFeatureRequest", async function (req, res) {
    log("CS_LockPremiumFeatureRequest", req);

    try {
      const {address} = req.data;

      const staked = await getUserStakedTokens(address);
      const user = await app.db.loadUser(address);

      if (staked < user.locked + user.unlocked) {
        // reset
        user.premium.locked = 0;
        user.premium.unlocked = staked;
        user.premium.features = [];
      } else {
        user.premium.unlocked = staked - user.premium.locked;
      }

      if (!user.premium.features.includes(req.data.key)) {
        user.premium.features.push(req.data.key);
        user.premium.locked += features[req.data.key];
        user.premium.unlocked -= features[req.data.key];
      }

      await app.db.saveUser(user);

      res("CS_LockPremiumFeatureResponse", {
        id: req.id,
        data: {status: 1},
      });
    } catch (e) {
      log("CS_LockPremiumFeatureRequest error");
      res("CS_LockPremiumFeatureResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });

  app.api.on("CS_GetUserUnlocksRequest", async function (req, res) {
    log("CS_GetUserUnlocksRequest", req);

    try {
      const {address} = req.data;

      const {locked, unlocked, features} = app.db.premium.users[address] || {
        locked: 0,
        unlocked: 0,
        features: [],
      };

      res("CS_GetUserUnlocksResponse", {
        id: req.id,
        data: {status: 1, locked, unlocked, features},
      });
    } catch (e) {
      log("CS_GetUserUnlocksRequest error");
      res("CS_GetUserUnlocksResponse", {
        id: req?.id,
        data: {status: 0, message: "Error"},
      });
    }
  });
}
