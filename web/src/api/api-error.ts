import { isEmpty, isNil } from "lodash"

import i18n from "@/plugins/vue-i18n-plugin"

/** Statuses with dedicated copy in locales; everything else falls back by family. */
const STATUSES_WITH_MESSAGES = [400, 401, 403, 404, 408, 410, 422, 429, 500, 503]

/**
 * Statuses where the server explains something the user can act on, such as which
 * field failed validation. For every other status the server message is written for
 * developers, so the friendly copy is shown instead.
 */
const STATUSES_WITH_ACTIONABLE_SERVER_MESSAGES = [400, 422]

export function buildUserMessage(status: number): string {
  if (!window.navigator.onLine) {
    return i18n.global.t("apiError.offline")
  }

  if (STATUSES_WITH_MESSAGES.includes(status)) {
    return i18n.global.t(`apiError.${status}`)
  }

  // 502 and 504 read as maintenance to a user, the same as 503.
  if (status === 502 || status === 504) {
    return i18n.global.t("apiError.503")
  }

  if (status >= 500) {
    return i18n.global.t("apiError.500")
  }

  return i18n.global.t("apiError.unknown")
}

export class ApiError extends Error {
  public readonly name = "ApiError"
  /** Friendly copy for this status, regardless of what the server said. */
  public readonly userMessage: string

  constructor(
    /** The raw message from the server or transport layer, kept for logging. */
    public readonly serverMessage: string,
    public readonly status: number
  ) {
    const userMessage = buildUserMessage(status)

    // Existing call sites surface error.message directly, so it carries the copy the
    // user should see, falling back to the server message only when it is actionable.
    const displayMessage =
      STATUSES_WITH_ACTIONABLE_SERVER_MESSAGES.includes(status) &&
      !isNil(serverMessage) &&
      !isEmpty(serverMessage)
        ? serverMessage
        : userMessage

    super(displayMessage)

    this.userMessage = userMessage
  }
}

export default ApiError
