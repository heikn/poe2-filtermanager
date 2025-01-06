FROM node:22
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY tsconfig.json .
COPY vite.config.ts .
COPY index.html .
COPY tsconfig.app.json .
COPY tsconfig.node.json .
EXPOSE 5173
CMD ["yarn", "dev"]
