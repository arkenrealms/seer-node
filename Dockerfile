FROM node:20

ARG CACHEBUST=1

WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y vim && rm -rf /var/lib/apt/lists/*
RUN npm install -g @microsoft/rush ts-node-dev

WORKDIR /usr/src/app
RUN git clone https://github.com/arkenrealms/arken.git
WORKDIR /usr/src/app/arken
RUN git submodule init
RUN git submodule update --remote --recursive
RUN rm rush.json
RUN mv rush.seer.json rush.json
WORKDIR /usr/src/app/arken/packages/node
RUN git checkout main
WORKDIR /usr/src/app/arken/packages/seer
RUN git checkout main
RUN git submodule init
RUN git submodule update --remote --recursive
RUN ls /usr/src/app/arken/packages/seer/
RUN ls /usr/src/app/arken/packages/seer/packages/node
WORKDIR /usr/src/app/arken/packages/seer/packages/protocol
RUN git checkout main
WORKDIR /usr/src/app/arken/packages/seer/packages/node
RUN git checkout main

RUN rush update

EXPOSE 7040

CMD ["sleep", "infinity"]
# CMD ["rushx dev"]