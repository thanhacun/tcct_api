FROM node:boron
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
COPY package-lock.json ./

RUN npm install
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD ["npm", "start"]

