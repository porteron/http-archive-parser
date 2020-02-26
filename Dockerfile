FROM node:10

EXPOSE 8082

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm install
CMD ["npm", "start"]