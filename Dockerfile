FROM node:alpine

RUN mkdir /app
RUN mkdir /app/config
RUN mkdir /app/lib
WORKDIR /app

ADD package.json /app/
RUN npm install

COPY hvacmon.js /app
COPY honeywelltc.js /app/lib/

ADD ./config.json /app/config/
ADD VERSION .
ADD Dockerfile .
ADD build_container.sh .

CMD [ "npm", "start" ]
