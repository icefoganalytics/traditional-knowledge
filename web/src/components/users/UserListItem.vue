<template>
  <v-skeleton-loader
    v-if="isNil(user)"
    type="list-item-two-line"
  />
  <v-list-item
    v-else
    v-bind="$attrs"
    :loading="isLoading"
    prepend-icon="mdi-account"
  >
    <template #append>
      <slot name="append"></slot>
    </template>
    <template #default>
      <p>
        <strong>{{ userTitle }}</strong>
      </p>
      <p v-if="!isNil(departmentAndBranch)">
        <em>{{ departmentAndBranch }}</em>
      </p>
      <p>{{ user.email }}</p>
      <slot name="default"></slot>
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { isEmpty, isNil } from "lodash"

import useUser from "@/use/use-user"

const props = defineProps<{
  userId: number
}>()

defineSlots<{
  default(): unknown
  append(): unknown
}>()

const { userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const userTitle = computed(() => {
  if (isNil(user.value)) return ""

  const { displayName, title } = user.value

  if (isEmpty(displayName)) return "Unknown (User)"
  if (isEmpty(title)) return displayName

  return `${displayName} - ${user.value.title}`
})

const departmentAndBranch = computed(() => {
  if (isNil(user.value)) return null

  const { department, branch } = user.value

  return [department, branch].filter(Boolean).join(" - ")
})
</script>
