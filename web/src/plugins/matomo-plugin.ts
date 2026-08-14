import { isEmpty } from "lodash"
import { type App } from "vue"

import { MATOMO_TRACKER_HOST, MATOMO_TRACKER_SITE_ID } from "@/config"
import router from "@/plugins/router-plugin"

declare global {
  interface Window {
    _paq?: unknown[][]
  }
}

/**
 * Matomo Analytics.
 *
 * No-ops when MATOMO_TRACKER_HOST is unset, so development and test builds never
 * contact a tracker. See https://matomo.org/faq/how-to/how-do-i-track-a-single-page-app/
 */
export function install(_app: App) {
  if (isEmpty(MATOMO_TRACKER_HOST)) return

  const paq = (window._paq = window._paq || [])
  paq.push(["enableLinkTracking"])
  paq.push(["setTrackerUrl", `${MATOMO_TRACKER_HOST}/matomo.php`])
  paq.push(["setSiteId", String(MATOMO_TRACKER_SITE_ID)])

  const script = document.createElement("script")
  script.async = true
  script.src = `${MATOMO_TRACKER_HOST}/matomo.js`
  document.head.appendChild(script)

  router.afterEach((to, from) => {
    if (from.fullPath !== to.fullPath) {
      paq.push(["setReferrerUrl", from.fullPath])
    }

    paq.push(["setCustomUrl", window.location.href])
    paq.push(["setDocumentTitle", document.title])
    paq.push(["trackPageView"])
  })
}

export default {
  install,
}
