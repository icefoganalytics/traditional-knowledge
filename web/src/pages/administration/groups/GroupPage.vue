<template>
  <GroupCard
    :group-id="groupIdAsNumber"
    :edit-button-props="editButtonProps"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter, type RouteLocation } from "vue-router"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import GroupCard from "@/components/groups/GroupCard.vue"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))

const router = useRouter()
const editButtonProps = computed(() => {
  const routeLocation: RouteLocation & {
    href: string
  } = router.resolve({
    name: "administration/groups/GroupPage",
    params: {
      groupId: props.groupId,
    },
  })

  return {
    to: {
      name: "administration/groups/GroupEditPage",
      params: {
        groupId: props.groupId,
      },
      query: {
        returnTo: routeLocation.href,
      },
    },
  }
})

useBreadcrumbs("Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
