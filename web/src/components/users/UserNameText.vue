<template>
  <v-progress-circular
    v-if="isLoading"
    size="16"
    width="2"
    indeterminate
  />
  <span v-else>{{ userTitle }}</span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isEmpty, isNil } from "lodash"

import useUser from "@/use/use-user"

const props = defineProps<{
  userId: number
}>()

const { userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const userTitle = computed(() => {
  if (isNil(user.value)) return ""

  const displayName =
    user.value.displayName ?? [user.value.firstName, user.value.lastName].filter(Boolean).join(" ")
  if (isEmpty(displayName)) return "Unknown"

  return displayName
})
</script>
