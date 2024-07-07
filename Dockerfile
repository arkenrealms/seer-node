FROM node:14

WORKDIR /usr/src/app
RUN apt-get update
RUN apt-get install nano
RUN npm install -g ts-node-dev

COPY . .

COPY id_ed25519 /root/.ssh/id_ed25519_databaser
RUN chmod 600 /root/.ssh/id_ed25519_databaser
COPY ssh_config /root/.ssh/config
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

# RUN git clone git@sdk:zeno-games/rune-backend-sdk.git
# WORKDIR /usr/src/app/rune-backend-sdk
# RUN git checkout 38625f33014c31f227fc1a8b82e2f9ed1b97a81a
# RUN yarn install
# RUN npm link

WORKDIR /usr/src/app
RUN git clone git@evors:zeno-games/databaser.git
WORKDIR /usr/src/app/databaser
RUN yarn install
RUN yarn run build

EXPOSE 7040

CMD ["yarn run start"]