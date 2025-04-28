<template>
  <GroupEditForm
    :group-id="groupIdAsNumber"
    :cancel-button-props="cancelButtonProps"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isNil, isEmpty, isString } from "lodash"
import { useRoute } from "vue-router"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import GroupEditForm from "@/components/groups/GroupEditForm.vue"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))

const route = useRoute()
const cancelButtonProps = computed(() => {
  const rawReturnTo = route.query.returnTo
  if (isNil(rawReturnTo) || isEmpty(rawReturnTo) || !isString(rawReturnTo)) {
    return {
      to: {
        name: "administration/GroupsPage",
      },
    }
  }

  return {
    to: rawReturnTo,
  }
})

useBreadcrumbs("Edit Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
