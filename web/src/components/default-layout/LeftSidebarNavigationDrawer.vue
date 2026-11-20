<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :rail="showRail"
    mobile-breakpoint="md"
    color="#a3a48d"
  >
    <v-list
      v-model:opened="open"
      class="pt-0"
      color="warning"
    >
      <v-list-item
        prepend-icon="mdi-library"
        style="height: 64px; opacity: 1"
        color="black"
        :to="{ name: 'DashboardPage' }"
      >
        <span class="text-h6">Main Menu</span>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'InformationSharingAgreementsPage',
        }"
        :exact="false"
        class="mt-4"
        prepend-icon="mdi-file-search"
      >
        <template #title>
          <span class="text-wrap">View Information Sharing Agreements</span>
        </template>
        <v-tooltip
          activator="parent"
          text="Information Sharing Agreements (ISAs)"
        />
      </v-list-item>

      <v-list-item
        title="Step 1: Create an ISA"
        :to="{
          name: 'information-sharing-agreements/InformationSharingAgreementNewPage',
        }"
        prepend-icon="mdi-file-document-edit"
      />

      <v-list-item
        title="Step 2: Add TK"
        :to="{
          name: 'InformationSharingAgreementsPage',
        }"
        exact
        prepend-icon="mdi-archive"
      />

      <v-list-item
        v-if="hasAdminAreaAccess"
        title="Administration"
        :to="{ name: 'administration/DashboardPage' }"
        :exact="false"
        prepend-icon="mdi-cog"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useDisplay } from "vuetify"

import useCurrentUser from "@/use/use-current-user"

const { mdAndUp } = useDisplay()

const showDrawer = ref(mdAndUp.value)
const showRail = ref(false)

function toggle() {
  if (!mdAndUp.value) {
    showDrawer.value = !showDrawer.value
  } else {
    showRail.value = !showRail.value
  }
}

const open = ref([])

const { hasAdminAreaAccess } = useCurrentUser<true>()

defineExpose({
  toggle,
})
</script>
