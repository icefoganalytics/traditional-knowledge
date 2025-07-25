<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <h4 class="mb-4">Add User to Group</h4>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <UserSearchableAutocomplete
          v-model="userGroupAttributes.userId"
          label="User *"
          :filters="userFilters"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-switch
          v-model="userGroupAttributes.isAdmin"
          label="Is group admin?"
        />
      </v-col>
    </v-row>

    <div class="d-flex mt-5">
      <v-btn
        :loading="isLoading"
        color="secondary"
        variant="outlined"
        :to="{
          name: 'administration/groups/GroupUsersPage',
          params: {
            groupId,
          },
        }"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        class="ml-3"
        :loading="isLoading"
        type="submit"
        color="primary"
      >
        Add
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { VForm } from "vuetify/components"

import { required } from "@/utils/validators"
import userGroupsApi, { type UserGroup } from "@/api/user-groups-api"
import useSnack from "@/use/use-snack"

import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"

const props = defineProps<{
  groupId: number
}>()

const userFilters = computed(() => ({
  notInGroup: props.groupId,
}))

const userGroupAttributes = ref<Partial<UserGroup>>({})

const snack = useSnack()
const router = useRouter()
const isLoading = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    await userGroupsApi.create({
      ...userGroupAttributes.value,
      groupId: props.groupId,
    })
    snack.success("User added to group.")
    router.push({
      name: "administration/groups/GroupUsersPage",
      params: {
        groupId: props.groupId,
      },
    })
  } catch (error) {
    console.error(`Failed to create user group: ${error}`, { error })
    snack.error(`Failed to add user to group: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
