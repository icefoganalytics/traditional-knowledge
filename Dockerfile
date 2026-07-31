# Stage 0 - base node customizations
FROM node:20.18.0-alpine3.19 AS base-node

RUN npm install -g npm@11.12.1

# Stage 1 - api build - requires development environment because typescript
FROM base-node AS api-build-stage

ENV NODE_ENV=development

WORKDIR /usr/src/api

COPY api/package*.json ./
COPY api/tsconfig*.json ./
RUN npm clean-install

COPY api ./

RUN npm run build

# Create production seeds directory if empty
RUN mkdir -p dist/db/seeds/production

# Copy html files, remove once we are using Vite for build process
COPY api/src/templates ./dist/templates

# Stage 2 - web build - requires development environment to install vue-cli-service
FROM base-node AS web-build-stage

ENV NODE_ENV=development

WORKDIR /usr/src/web

COPY web/package*.json ./
COPY web/tsconfig*.json ./
COPY web/vite.config.js ./
RUN npm clean-install

COPY web ./

ARG VITE_TEMPORARY_HOST_SUFFIX
ARG VITE_TEMPORARY_AUTH0_DOMAIN
ARG VITE_TEMPORARY_AUTH0_AUDIENCE
ARG VITE_TEMPORARY_AUTH0_CLIENT_ID
ENV NODE_ENV=production
ENV VITE_TEMPORARY_HOST_SUFFIX=${VITE_TEMPORARY_HOST_SUFFIX}
ENV VITE_TEMPORARY_AUTH0_DOMAIN=${VITE_TEMPORARY_AUTH0_DOMAIN}
ENV VITE_TEMPORARY_AUTH0_AUDIENCE=${VITE_TEMPORARY_AUTH0_AUDIENCE}
ENV VITE_TEMPORARY_AUTH0_CLIENT_ID=${VITE_TEMPORARY_AUTH0_CLIENT_ID}
RUN npm run build

# Stage 3 - production setup
FROM base-node

ARG RELEASE_TAG
ARG GIT_COMMIT_HASH

ENV RELEASE_TAG=${RELEASE_TAG}
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

# Persists TZ=UTC effect after container build and into container run
# Ensures dates/times are consistently formated as UTC
# Conversion to local time should happen in the UI
ENV TZ=UTC

ENV NODE_ENV=production

# Updating npm did not fix this issue, though it might at a future date.
# Fix Your cache folder contains root-owned files, due to a bug in previous versions of npm which has since been addressed.
RUN mkdir -p /home/node/.npm
RUN chown -R node:node "/home/node/.npm"

USER node
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app

COPY --from=api-build-stage --chown=node:node /usr/src/api/package*.json ./
RUN npm clean-install && npm cache clean --force --loglevel=error

COPY --from=api-build-stage --chown=node:node /usr/src/api/dist ./dist/
COPY --from=web-build-stage --chown=node:node /usr/src/web/dist ./dist/web/

RUN echo "RELEASE_TAG=${RELEASE_TAG}" >> VERSION
RUN echo "GIT_COMMIT_HASH=${GIT_COMMIT_HASH}" >> VERSION

EXPOSE 3000

COPY --from=api-build-stage --chown=node:node /usr/src/api/bin/boot-app.sh ./bin/

RUN chmod +x ./bin/boot-app.sh

CMD ["./bin/boot-app.sh"]
