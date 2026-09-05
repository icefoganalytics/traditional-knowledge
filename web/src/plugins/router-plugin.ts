import { createRouter, createWebHistory } from "vue-router"
import { authGuard } from "@auth0/auth0-vue"

import { APPLICATION_NAME } from "@/config"
import routes from "@/routes"

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  document.title = to.meta.title ? `${APPLICATION_NAME} : ${to.meta.title}` : APPLICATION_NAME

  if (to.meta.requiresAuth === false) return true

  const isAuthenticated = await authGuard(to)
  if (isAuthenticated) return true

  return false
})

router.onError((error, to) => {
  if (
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed")
  ) {
    window.location.href = to.fullPath
  }
})

export default router
