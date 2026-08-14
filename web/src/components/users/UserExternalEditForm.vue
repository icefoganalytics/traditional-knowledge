<template>
  <v-skeleton-loader
    v-if="isNil(user)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-card class="border">
      <v-card-title>External User Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.email"
              label="Email *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <ExternalOrganizationSearchableAutocomplete
              v-model="user.externalOrganizationId"
              label="Yukon First Nation or Indigenous Government *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.firstName"
              label="First name *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.lastName"
              label="Last name *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.displayName"
              label="Display Name"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.title"
              label="Title"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="user.phoneNumber"
              label="Phone Number"
            />
          </v-col>
          <v-col
            v-if="canManageExternalUsers"
            cols="12"
            md="3"
          >
            <UserAccountActivationSwitch
              :user-id="user.id"
              :is-active="isNil(user.deactivatedAt)"
              :disabled="user.id === currentUser.id"
              @success="refresh"
            />
            <v-tooltip
              v-if="user.id === currentUser.id"
              activator="parent"
            >
              <span>You cannot change account activation of current user.</span>
            </v-tooltip>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-switch
              v-model="user.emailNotificationsEnabled"
              label="Receive email notifications"
              :false-value="false"
              :true-value="true"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text>
        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              :loading="isLoading"
              color="secondary"
              variant="outlined"
              v-bind="cancelButtonOptions"
            >
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="policy?.update"
              class="ml-3"
              :loading="isLoading"
              color="primary"
              variant="outlined"
              @click="sync"
            >
              <v-icon class="mr-2">mdi-sync</v-icon>
              Sync
            </v-btn>
            <v-btn
              class="ml-3"
              :loading="isLoading"
              type="submit"
              color="primary"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, toRefs } from "vue"

import { type VBtn, type VForm } from "vuetify/components"

import { required } from "@/utils/validators"
import usersApi from "@/api/users-api"

import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"
import useUser from "@/use/use-user"

import UserAccountActivationSwitch from "@/components/users/UserAccountActivationSwitch.vue"

type CancelButtonOptions = VBtn["$props"]

const props = withDefaults(
  defineProps<{
    userId: number
    cancelButtonOptions?: CancelButtonOptions
  }>(),
  {
    cancelButtonOptions: ({ userId }) => ({
      to: {
        name: "UserPage",
        params: { userId },
      },
    }),
  }
)

const emit = defineEmits<{
  saved: [userId: number]
}>()

const { userId } = toRefs(props)
const { user, policy, isLoading, save, refresh: refreshUser } = useUser(userId)

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()
const {
  currentUser,
  canManageExternalUsers,
  refresh: refreshCurrentUser,
} = useCurrentUser<true>()

async function saveWrapper() {
  if (isNil(user.value)) return
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    await save()

    if (user.value.id === currentUser.value.id) {
      await refreshCurrentUser()
      snack.info("Saved and reloaded current user!")
    } else {
      snack.success("User saved!")
    }

    emit("saved", user.value.id)
  } catch (error) {
    console.error(`Failed to save user: ${error}`, { error })
    snack.error(`Failed to save user: ${error}`)
  }
}

async function refresh() {
  await refreshUser()

  if (user.value?.id === currentUser.value.id) {
    await refreshCurrentUser()
  }
}

async function sync() {
  if (isNil(user.value)) return

  isLoading.value = true
  try {
    await usersApi.directorySync(user.value.id)

    if (user.value.id === currentUser.value.id) {
      await refreshCurrentUser()
      snack.info("Synced and reloaded current user!")
    } else {
      await refreshUser()
      snack.success("User synced!")
    }

    emit("saved", user.value.id)
  } catch (error) {
    console.error(`Failed to sync user: ${error}`, { error })
    snack.error(`Failed to sync user: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
