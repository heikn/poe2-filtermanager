FROM node:22
WORKDIR /app
COPY .env .
COPY package.json .
RUN yarn install
COPY tsconfig.json .
EXPOSE 3000
CMD ["yarn","dev"]
