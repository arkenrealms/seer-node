import axios from 'axios';
import path from 'path';
import jetpack from 'fs-jetpack';
import beautify from 'json-beautify';
import { log, random } from '@arken/node/util';
import { toFixed } from '@arken/node/util/math';

const rewardRunes = ['el', 'tir', 'zod', 'nef', 'sol', 'ist', 'gul', 'fal', 'um', 'ort'];

export async function monitorDao(app) {
  try {
    log('Update proposals');

    const response = await axios.post(
      'https://hub.snapshot.org/graphql',
      {
        operationName: 'Proposals',
        variables: {
          first: 6,
          skip: 0,
          space_in: ['runemetaverse.eth'],
          state: 'all',
          author_in: [],
        },
        query: `query Proposals($first: Int!, $skip: Int!, $state: String!, $space: String, $space_in: [String], $author_in: [String]) {
          proposals(
            first: $first
            skip: $skip
            where: {space: $space, state: $state, space_in: $space_in, author_in: $author_in}
          ) {
            id
            ipfs
            title
            body
            start
            end
            state
            author
            created
            choices
            space {
              id
              name
              members
              avatar
              symbol
            }
            scores_state
            scores_total
            scores
            votes
            quorum
            symbol
          }
        }`,
      },
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          pragma: 'no-cache',
          'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          Referer: 'https://vote.arken.gg/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      }
    );

    const res = response.data;

    for (const _proposal of res.data.proposals) {
      let proposal = app.db.dao.proposals.find((p) => p.id === _proposal.id);

      if (!proposal) {
        proposal = _proposal;

        app.db.dao.proposals.push(proposal);
      }
      const response2 = await axios.post(
        'https://hub.snapshot.org/graphql',
        {
          operationName: 'Votes',
          variables: {
            id: proposal.id,
            orderBy: 'vp',
            orderDirection: 'desc',
            first: 100,
          },
          query: `query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {
            votes(
              first: $first
              skip: $skip
              where: {proposal: $id, vp_gt: 0, voter: $voter}
              orderBy: $orderBy
              orderDirection: $orderDirection
            ) {
              ipfs
              voter
              choice
              vp
              vp_by_strategy
            }
          }`,
        },
        {
          headers: {
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            pragma: 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            Referer: 'https://vote.arken.gg/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        }
      );

      const res2 = response2.data;

      if (!proposal.isProcessed) {
        proposal.voteList = res2.data.votes;

        if (proposal.state === 'closed') {
          proposal.isProcessed = true;

          if (!proposal.rewardToken) {
            proposal.rewardToken = rewardRunes[random(0, rewardRunes.length - 1)];
          }

          proposal.rewardPool = 0;

          for (const vote of proposal.voteList) {
            proposal.rewardPool += vote.vp / 1000000;
          }

          proposal.rewardPool = Math.round(proposal.rewardPool);

          proposal.validVoters = 0;

          for (const vote of proposal.voteList) {
            if (vote.vp < 1000) continue;

            const user = await app.db.loadUser(vote.voter);

            if (!user?.username) continue;

            proposal.validVoters += 1;
          }

          for (const vote of proposal.voteList) {
            const user = await app.db.loadUser(vote.voter);

            if (!user?.username) continue;

            vote.username = user.username;

            if (vote.vp < 1000) continue;

            vote.rewarded = parseFloat(toFixed(proposal.rewardPool / proposal.validVoters, 2));

            if (!user.daoVotes.includes(proposal.id)) user.daoVotes.push(proposal.id);

            user.points += 10;

            if (!user.rewards.runes[proposal.rewardToken]) {
              user.rewards.runes[proposal.rewardToken] = 0;
            }

            user.rewards.runes[proposal.rewardToken] += vote.rewarded;

            await app.db.saveUser(user);
          }

          app.db.oracle.outflow.daoVoting.tokens.week[proposal.rewardToken.toLowerCase()] += proposal.rewardPool;
        }
      }
    }

    jetpack.write(path.resolve(`./db/dao/proposals.json`), beautify(app.db.dao.proposals, null, 2), {
      atomic: true,
      jsonIndent: 0,
    });
  } catch (e) {
    log('Error', e);
  }

  setTimeout(() => monitorDao(app), 60 * 60 * 1000);
}
