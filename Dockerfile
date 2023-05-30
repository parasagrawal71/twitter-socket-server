FROM node:16-alpine

WORKDIR /opt
COPY . .
RUN npm install
EXPOSE 6002
CMD ["npm", "start"]