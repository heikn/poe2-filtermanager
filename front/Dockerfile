FROM node:22
WORKDIR /app
COPY package.json .
COPY yarn.lock .
# Use real .env if present; otherwise fall back to .env.example
COPY .env* ./
RUN if [ -f .env ]; then echo "Using provided .env"; \
	elif [ -f .env.example ]; then cp .env.example .env; echo "Using .env.example as .env"; \
	else echo "No .env or .env.example found"; fi
RUN yarn install
COPY tsconfig.json .
COPY vite.config.ts .
COPY index.html .
COPY tsconfig.app.json .
COPY tsconfig.node.json .
EXPOSE 5173
CMD ["yarn", "dev"]
