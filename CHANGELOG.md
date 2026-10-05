# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Added `bin/deploy temporary` for disposable public Azure Container Apps environments from pull requests, branches, or immutable git hashes, including readiness checks, persisted cleanup state, and non-production resource guardrails.

### Changed

- Renamed temporary deployment environment variables to the `TEMPORARY_DEPLOYMENT_*` namespace to make the public configuration contract explicit.