<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-text-field
          v-model="informationSharingAgreement.title"
          label="Title *"
          :rules="[required]"
          required
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="informationSharingAgreement.purpose"
          label="What is the purpose, work, program, decision, or project this Traditional Knowledge (TK) will inform? *"
          :rules="[required]"
          required
          auto-grow
          rows="8"
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col
        cols="12"
        md="6"
      >
        <UserSearchableAutocomplete
          v-model="informationSharingAgreement.externalGroupContactId"
          label="Yukon First Nation or Indigenous Government Contact Name *"
          :where="externalGroupContactWhere"
          :rules="[required]"
          required
          @click:clear="updateExternalGroupContactTitle(null)"
          @selected="updateExternalGroupContactTitle"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="informationSharingAgreement.externalGroupContactTitle"
          label="Yukon First Nation or Indigenous Government Contact Title *"
          :rules="[required]"
          required
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col
        cols="12"
        md="6"
      >
        <UserSearchableAutocomplete
          v-model="informationSharingAgreement.internalGroupContactId"
          label="Yukon Government (YG) Contact Name *"
          :where="internalGroupContactWhere"
          :rules="[required]"
          required
          @click:clear="updateInternalGroupContactTitle(null)"
          @selected="updateInternalGroupContactTitle"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="informationSharingAgreement.internalGroupContactTitle"
          label="Yukon Government (YG) Contact Title *"
          :rules="[required]"
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <YukonGovernmentEmployeeSearchableAutocomplete
          v-model="managerEmail"
          label="Yukon Government (YG) Manager Contact Name *"
          hint="Typically the manager of the primary YG contact, but can be any appropriate internal contact. Search the Active Directory."
          :rules="[required]"
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex flex-column flex-md-row ga-3">
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :block="smAndDown"
        >
          Save
        </v-btn>
        <v-btn
          :to="{
            name: 'information-sharing-agreements/InformationSharingAgreementPage',
            params: {
              informationSharingAgreementId,
            },
          }"
          color="secondary"
          variant="outlined"
          :loading="isLoading"
          :block="smAndDown"
        >
          Cancel
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue"
import { useRouter } from "vue-router"
import { useDisplay } from "vuetify"
import { isEmpty, isNil } from "lodash"

import { required } from "@/utils/validators"

import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"
import usersApi from "@/api/users-api"

import UserSearchableAutocomplete, {
  type UserAsIndex,
} from "@/components/users/UserSearchableAutocomplete.vue"
import YukonGovernmentEmployeeSearchableAutocomplete from "@/components/yukon-government-directory/YukonGovernmentEmployeeSearchableAutocomplete.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)
const { informationSharingAgreement, isLoading, save } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const managerEmail = ref<string | null | undefined>(undefined)

watch(
  () => informationSharingAgreement.value?.internalGroupSecondaryContactId,
  async (secondaryContactId) => {
    if (isNil(secondaryContactId)) {
      managerEmail.value = undefined
      return
    }

    const { user } = await usersApi.get(secondaryContactId)
    managerEmail.value = user.email
  },
  { immediate: true }
)

const externalGroupContactWhere = computed(() => ({
  isExternal: true,
}))
const internalGroupContactWhere = computed(() => ({
  isExternal: false,
}))

function updateExternalGroupContactTitle(user: UserAsIndex | null) {
  if (isNil(informationSharingAgreement.value)) return

  if (isNil(user)) {
    informationSharingAgreement.value.externalGroupContactTitle = null
  } else {
    informationSharingAgreement.value.externalGroupContactTitle = user.title
  }
}

function updateInternalGroupContactTitle(user: UserAsIndex | null) {
  if (isNil(informationSharingAgreement.value)) return

  if (isNil(user)) {
    informationSharingAgreement.value.internalGroupContactTitle = null
  } else {
    informationSharingAgreement.value.internalGroupContactTitle = user.title
  }
}

const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  try {
    if (isNil(informationSharingAgreement.value)) return

    if (!isNil(managerEmail.value) && !isEmpty(managerEmail.value)) {
      const { user } = await usersApi.ensureFromDirectory(managerEmail.value)
      informationSharingAgreement.value.internalGroupSecondaryContactId = user.id
    } else {
      informationSharingAgreement.value.internalGroupSecondaryContactId = null
    }

    await save()
    snack.success("Basic Information updated.")

    await router.push({
      name: "information-sharing-agreements/InformationSharingAgreementEditDurationPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    })
  } catch (error) {
    console.error(`Failed to update basic information: ${error}`, { error })
    snack.error(`Failed to update basic information: ${error}`)
  }
}

const { smAndDown } = useDisplay()
</script>
