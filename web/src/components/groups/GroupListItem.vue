<template>
  <v-skeleton-loader
    v-if="isNil(group)"
    type="list-item-two-line"
  />
  <v-list-item
    v-else
    v-bind="$attrs"
    :loading="isLoading"
    prepend-icon="mdi-account-group"
  >
    <template #append>
      <slot name="append"></slot>
    </template>
    <template #default>
      <p>
        <strong>{{ groupTitle }}</strong>
      </p>
      <slot name="default"></slot>
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useGroup from "@/use/use-group"

const props = defineProps<{
  groupId: number
}>()

defineSlots<{
  default(): unknown
  append(): unknown
}>()

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
