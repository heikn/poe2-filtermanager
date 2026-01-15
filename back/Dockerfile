FROM node:22
WORKDIR /app
# Use real .env if present; otherwise fall back to .env.example
COPY .env* ./
RUN if [ -f .env ]; then echo "Using provided .env"; \
	elif [ -f .env.example ]; then cp .env.example .env; echo "Using .env.example as .env"; \
	else echo "No .env or .env.example found"; fi
COPY package.json .
RUN yarn install
COPY tsconfig.json .
EXPOSE 3000
CMD ["yarn","dev"]
