import { stripTrailingSlash } from "@/utils/strip-trailing-slash"

export const ENVIRONMENT = import.meta.env.MODE
const DEVELOPMENT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

/** Matomo tracking is disabled unless the host is configured for the environment. */
const MATOMO_HOST = import.meta.env.VITE_MATOMO_HOST || ""
const MATOMO_SITE_ID = 115

const prodConfig = {
  domain: "https://yukon.eu.auth0.com",
  clientId: "cGFfr4ZNoqn88sJGBS8VgnbG6oCV2ACc",
  audience: "generic-production",
  apiBaseUrl: "",
  applicationName: "Traditional Knowledge",
  matomoHost: MATOMO_HOST,
  matomoSiteId: MATOMO_SITE_ID,
}

const uatConfig = {
  domain: "https://yukon-staging.eu.auth0.com",
  clientId: "11878vWk1pmhwyVQwsr2m2zM3w3e912U",
  audience: "generic-uat",
  apiBaseUrl: "",
  applicationName: "Traditional Knowledge - UAT",
  matomoHost: MATOMO_HOST,
  matomoSiteId: MATOMO_SITE_ID,
}

const devConfig = {
  domain: "https://dev-0tc6bn14.eu.auth0.com",
  clientId: "fsWyrDohhHtojdOpOFnAYtFMxwAMHUEF",
  audience: "testing",
  apiBaseUrl: DEVELOPMENT_API_BASE_URL,
  applicationName: "Traditional Knowledge",
  matomoHost: MATOMO_HOST,
  matomoSiteId: MATOMO_SITE_ID,
}

const localProductionConfig = {
  domain: "https://yukon.eu.auth0.com",
  clientId: "cGFfr4ZNoqn88sJGBS8VgnbG6oCV2ACc",
  audience: "generic-production",
  apiBaseUrl: "http://localhost:8080",
  applicationName: "Traditional Knowledge",
  matomoHost: MATOMO_HOST,
  matomoSiteId: MATOMO_SITE_ID,
}

let config = prodConfig

const isDevelopmentHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "traditional-knowledge.localhost" ||
  window.location.hostname.endsWith(".traditional-knowledge.localhost")

if (ENVIRONMENT === "production" && window.location.host === "localhost:8080") {
  config = localProductionConfig
} else if (ENVIRONMENT !== "production" && isDevelopmentHost) {
  config = devConfig
} else if (window.location.host === "yg-wrap-uat.azurewebsites.net") {
  config = uatConfig
}

export const APPLICATION_NAME = config.applicationName

export const API_BASE_URL = config.apiBaseUrl

export const AUTH0_DOMAIN = stripTrailingSlash(config.domain)
export const AUTH0_AUDIENCE = config.audience
export const AUTH0_CLIENT_ID = config.clientId

export const MATOMO_TRACKER_HOST = stripTrailingSlash(config.matomoHost)
export const MATOMO_TRACKER_SITE_ID = config.matomoSiteId
