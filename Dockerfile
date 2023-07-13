FROM node:18

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm install

CMD ["npm", "run", "dev"]