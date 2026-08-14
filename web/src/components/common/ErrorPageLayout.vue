<template>
  <v-container class="text-center mt-16">
    <h1>{{ heading }}</h1>
    <p>{{ message }}</p>

    <slot />

    <v-row class="mt-6">
      <v-spacer />
      <v-col>
        <v-btn
          color="primary"
          variant="outlined"
          @click="goBack"
          >Back</v-btn
        >
      </v-col>
      <v-spacer />
    </v-row>

    <hr />
    <p>Site: {{ APPLICATION_NAME }}</p>
    <p>Version: {{ releaseTag }}</p>
    <p>Commit Hash: {{ gitCommitHash }}</p>
  </v-container>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router"

import { APPLICATION_NAME } from "@/config"
import useStatus from "@/use/use-status"

defineProps<{
  heading: string
  message: string
}>()

const router = useRouter()
const { releaseTag, gitCommitHash } = useStatus()

function goBack() {
  // Going back to the dashboard beats a dead-end when the error page is the first
  // entry in history, e.g. when it was opened directly from a link.
  if (window.history.state?.back) {
    router.back()
    return
  }

  router.push({ name: "DashboardPage" })
}
</script>

<style scoped>
hr {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
