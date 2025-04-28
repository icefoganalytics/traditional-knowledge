<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-card>
      <template #title>Add User to Group</template>
      <template #text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <UserSearchableAutocomplete
              v-model="userGroupAttributes.userId"
              label="User *"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
        </v-row>
      </template>
      <template #actions>
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
          Create
        </v-btn>
      </template>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref } from "vue"
import { useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import userGroupsApi, { type UserGroup } from "@/api/user-groups-api"
import useSnack from "@/use/use-snack"

import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"

const props = defineProps<{
  groupId: number
}>()

const snack = useSnack()
const router = useRouter()

const userGroupAttributes = ref<Partial<UserGroup>>({
  groupId: props.groupId,
})
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
    await userGroupsApi.create(userGroupAttributes.value)
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
