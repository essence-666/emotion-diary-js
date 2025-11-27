FROM node:20

COPY ./package.json .

COPY ./backend . 

RUN npm install

EXPOSE 5000

CMD ["node", "server.js"]