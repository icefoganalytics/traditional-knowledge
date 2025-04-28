<template>
  <div class="d-flex">
    <FilterSearchDebouncedTextField
      v-model="search"
      class="mb-4 mr-5"
      label="Search"
      density="compact"
    />
    <v-btn
      color="primary"
      :to="{
        name: 'administration/groups/GroupUserNewPage',
        params: {
          groupId: props.groupId,
        },
      }"
      style="height: 40px"
    >
      Add User
    </v-btn>
  </div>

  <UserGroupsAsUsersEditDataTableServer
    :where="where"
    :filters="filters"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import FilterSearchDebouncedTextField from "@/components/common/tables/FilterSearchDebouncedTextField.vue"
import UserGroupsAsUsersEditDataTableServer from "@/components/user-groups/UserGroupsAsUsersEditDataTableServer.vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))
const where = computed(() => ({
  groupId: groupIdAsNumber.value,
}))

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    searchUser: search.value,
  }
})

useBreadcrumbs("Groups", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
