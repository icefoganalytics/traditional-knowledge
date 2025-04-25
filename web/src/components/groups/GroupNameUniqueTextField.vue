<template>
  <UniqueTextField
    v-model="groupName"
    label="Name"
    :check-availability="checkNameAvailability"
    unique-validation-message="Group name must be unique"
    is-unique-message="Group name is available"
    is-not-unique-message="Group name is already taken"
  />
</template>

<script setup lang="ts">
import groupsApi, { type GroupFiltersOptions } from "@/api/groups-api"

import UniqueTextField from "@/components/common/UniqueTextField.vue"

const groupName = defineModel<string | null | undefined>({
  required: true,
})

const props = withDefaults(
  defineProps<{
    filters?: GroupFiltersOptions
  }>(),
  {
    filters: () => ({}),
  }
)

async function checkNameAvailability(name: string) {
  const { groups } = await groupsApi.list({
    where: {
      name,
    },
    filters: props.filters,
    perPage: 1, // We only need one result to check availability
  })
  return groups.length === 0
}
</script>
