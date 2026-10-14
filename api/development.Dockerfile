FROM node:24.22.0-alpine3.24

RUN npm install -g npm@11.12.1

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN chmod +x ./bin/boot-app.sh

CMD ["/usr/src/api/bin/boot-app.sh"]
