FROM node:latest
RUN rm -rf /worker
WORKDIR /worker
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]