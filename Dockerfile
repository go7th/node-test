# VERSION               0.4
FROM node:10.16-alpine

COPY . .

ENTRYPOINT ["npm", "start"]
