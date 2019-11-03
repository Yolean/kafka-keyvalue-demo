FROM node:12.13.0-alpine@sha256:50ce309a948aaad30ee876fb07ccf35b62833b27de4d3a818295982efb04ce6b \
  as prepare

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./ ./

RUN ls -l

ENTRYPOINT [ "tail", "-f", "/dev/null" ]

FROM prepare

ENTRYPOINT [ "node", "--experimental-modules", "./src/index.js" ]