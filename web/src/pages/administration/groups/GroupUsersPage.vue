<template>
  <div class="d-flex mb-4">
    <FilterSearchDebouncedTextField
      v-model="search"
      label="Search"
      density="compact"
    />
    <v-btn
      v-if="policy?.update"
      class="ml-5"
      color="primary"
      :to="{
        name: 'administration/groups/GroupUserNewPage',
        params: {
          groupId,
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
import useGroup from "@/use/use-group"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))
const { policy } = useGroup(groupIdAsNumber)

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

useBreadcrumbs("Group Users", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
  {
    title: "Group",
    to: {
      name: "administration/groups/GroupPage",
      params: {
        groupId: props.groupId,
      },
    },
  },
])
</script>
