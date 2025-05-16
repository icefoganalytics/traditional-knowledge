<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        icon="mdi-dots-vertical"
        color="#f7f9ef"
        v-bind="props"
      ></v-btn>
    </template>

    <v-list>
      <v-list-item
        :title="username"
        :to="{ name: 'ProfilePage' }"
        prepend-icon="mdi-account"
      />
      <v-list-item
        v-if="isSystemAdmin"
        title="Administration"
        :to="{ name: 'administration/DashboardPage' }"
        prepend-icon="mdi-cog-outline"
      />
      <v-list-item
        title="Sign out"
        prepend-icon="mdi-exit-run"
        @click="signOut"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { useAuth0 } from "@auth0/auth0-vue"
import useCurrentUser from "@/use/use-current-user"

const { logout } = useAuth0()

const { currentUser, isSystemAdmin, reset: resetCurrentUser } = useCurrentUser()

const username = computed(() => {
  if (currentUser.value === null) return "loading..."

  const { displayName } = currentUser.value
  return displayName
})

function signOut() {
  resetCurrentUser()

  // I would prefer to redirect to /sign-in here, but that requires updating the auth0 application settings
  // const returnTo = encodeURI(window.location.origin + "/sign-in")
  const returnTo = window.location.origin
  return logout({
    logoutParams: {
      returnTo,
    },
  })
}
</script>
