<template>
  <ErrorPageLayout
    heading="Unauthorized (401)"
    :message="t('apiError.401')"
  >
    <p>Alternatively, try logging out and signing in again.</p>

    <v-row class="mt-6">
      <v-spacer />
      <v-col>
        <v-btn
          color="primary"
          @click="signOut"
          >Logout</v-btn
        >
      </v-col>
      <v-spacer />
    </v-row>
  </ErrorPageLayout>
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue"
import { useI18n } from "vue-i18n"

import useCurrentUser from "@/use/use-current-user"

import ErrorPageLayout from "@/components/common/ErrorPageLayout.vue"

const { t } = useI18n()
const { logout } = useAuth0()
const { reset: resetCurrentUser } = useCurrentUser()

async function signOut() {
  resetCurrentUser()

  const returnTo = encodeURI(window.location.origin)
  return logout({
    logoutParams: {
      returnTo,
    },
  })
}
</script>
