FROM node:8.14.0-alpine

MAINTAINER zhydxyx2014@163.com

COPY  ./build/  /fwe/

WORKDIR /fwe

CMD ["node","server.js"]
