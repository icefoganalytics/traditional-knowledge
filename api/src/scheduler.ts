import { scheduleJob } from "node-schedule"

import { APPLICATION_NAME, NODE_ENV } from "@/config"
import logger from "@/utils/logger"
import { InformationSharingAgreements } from "@/services"

async function startScheduler() {
  logger.info(`Scheduler starting in ${APPLICATION_NAME}`)

  // Daily is enough: expiry is driven by a date, and it keeps the idempotency check cheap.
  scheduleJob("informationSharingAgreementExpiry", "0 8 * * *", async () => {
    try {
      await InformationSharingAgreements.NotifyOfUpcomingExpiryService.perform()
    } catch (error) {
      logger.error(`Failed to notify of upcoming agreement expiry: ${error}`, { error })
    }
  })
}

if (require.main === module) {
  ;(async () => {
    if (NODE_ENV === "test") {
      logger.info("Scheduler is disabled in the test environment")
      return
    }

    try {
      await startScheduler()
      logger.info(`${APPLICATION_NAME} scheduler started`)
    } catch (error) {
      logger.error(`Failed to start scheduler: ${error}`, { error })
      process.exit(1)
    }
    // No process.exit on success: the process must stay alive for jobs to fire.
  })()
}

export default startScheduler
