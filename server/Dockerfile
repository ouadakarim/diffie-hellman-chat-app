FROM node:10.15.3

RUN mkdir /code
WORKDIR /code

COPY package.json /code/package.json
RUN npm install
RUN npm install -g gulp
