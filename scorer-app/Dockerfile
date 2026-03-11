FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npx expo install @expo/metro-runtime

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npm", "start", "--", "--web"]
