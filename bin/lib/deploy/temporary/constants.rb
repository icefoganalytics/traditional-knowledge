#!/usr/bin/env ruby

require "fileutils"
require "digest"
require "json"
require "net/http"
require "open3"
require "optparse"
require "securerandom"
require "tempfile"
require "tmpdir"
require "time"
require "uri"

module TraditionalKnowledgeTemporaryDeployment
  REPOSITORY = "icefoganalytics/traditional-knowledge"
  APP_PREFIX = "tk-temporary-"
  SCOPE_TAG = "traditional-knowledge-temporary"
  DEFAULT_STATE_DIR = File.expand_path("~/.traditional-knowledge-temporary")
  UAT_AUTH0_DOMAIN = "https://yukon-staging.eu.auth0.com"
  UAT_AUTH0_AUDIENCE = "generic-uat"
  UAT_AUTH0_CLIENT_ID = "11878vWk1pmhwyVQwsr2m2zM3w3e912U"
end
