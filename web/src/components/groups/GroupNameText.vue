<template>
  <v-progress-circular
    v-if="isLoading"
    size="16"
    width="2"
    indeterminate
  />
  <span v-else>{{ groupTitle }}</span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useGroup from "@/use/use-group"

const props = defineProps<{
  groupId: number
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
