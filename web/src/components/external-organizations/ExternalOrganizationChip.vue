<template>
  <v-skeleton-loader
    v-if="isNil(externalOrganization)"
    type="chip"
  />
  <v-chip
    v-else
    v-bind="$attrs"
    :loading="isLoading"
    variant="text"
    :class="classes"
    :size="size"
    color="primary"
  >
    {{ externalOrganization.name }}
    <v-icon
      right
      size="large"
      >mdi-menu-down</v-icon
    >
    <v-menu
      v-model="isShowingMenu"
      activator="parent"
      :close-on-content-click="false"
    >
      <v-card
        class="mx-auto"
        max-width="450"
        :title="externalOrganization.name"
      >
        <v-card-text>
          <v-row
            class="mt-0"
            dense
          >
            <v-col cols="12">
              Name: <strong>{{ externalOrganization.name }}</strong>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-chip>
</template>

<script lang="ts" setup>
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import { type VChip } from "vuetify/components"

import useExternalOrganization from "@/use/use-external-organization"

const props = withDefaults(
  defineProps<{
    externalOrganizationId: number | null
    classes?: Record<string, boolean> | string[] | string
    size?: VChip["size"]
  }>(),
  {
    classes: "cursor-pointer",
    size: "large",
  }
)

const { externalOrganizationId } = toRefs(props)
const { externalOrganization, isLoading } = useExternalOrganization(externalOrganizationId)

const isShowingMenu = ref(false)
</script>

<style scoped>
.v-chip:hover {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}
</style>
