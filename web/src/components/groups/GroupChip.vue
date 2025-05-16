<template>
  <v-chip
    v-bind="$attrs"
    :loading="isLoading"
    variant="text"
    :class="classes"
    :size="size"
    color="primary"
    style="height: 18px; border-radius: 4px; padding-left: 4px; padding-right: 8px"
  >
    <v-progress-circular
      v-if="isLoading"
      size="20"
      width="2"
      indeterminate
    />
    <template v-else-if="isNil(group)">
      <em>unset</em>
    </template>
    <template v-else>
      <strong
        class="text-primary"
        style="font-weight: 600; font-size: 14px"
        >{{ groupTitle }}</strong
      >
      <v-icon
        right
        size="large"
        >mdi-menu-down</v-icon
      >
      <v-menu
        activator="parent"
        :close-on-content-click="false"
      >
        <v-card
          class="mx-auto"
          max-width="450"
          :title="groupTitle"
        >
          <v-card-text>
            <v-row
              class="mt-0"
              dense
            >
              <v-col cols="12">
                Description: <strong>{{ group.description }}</strong>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-menu>
    </template>
  </v-chip>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { VChip } from "vuetify/lib/components/index.mjs"

import useGroup from "@/use/use-group"

const props = withDefaults(
  defineProps<{
    groupId: number
    classes?: Record<string, boolean> | string[] | string
    size?: VChip["size"]
  }>(),
  {
    classes: "cursor-pointer",
    size: "large",
  }
)

const { groupId } = toRefs(props)
const { group, isLoading } = useGroup(groupId)

const groupTitle = computed(() => {
  if (isNil(group.value)) return ""

  const { name, acronym } = group.value
  if (isNil(acronym)) {
    return name
  }

  return `${name} (${acronym})`
})
</script>

<style scoped>
.v-chip:hover {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}
</style>
