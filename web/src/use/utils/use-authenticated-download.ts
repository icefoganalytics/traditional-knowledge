import { ref, nextTick, type Ref } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"

export function useAuthenticatedDownload(actionUrl: Ref<string>) {
  const { getAccessTokenSilently } = useAuth0()

  const isLoading = ref(false)

  async function submit() {
    isLoading.value = true
    try {
      const accessToken = await getAccessTokenSilently()

      // Create form element
      const form = document.createElement("form")
      form.action = actionUrl.value
      form.method = "post"
      form.target = "_blank"

      // Create hidden input
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = "HOISTABLE_AUTHORIZATION_TOKEN"
      input.value = accessToken

      // Append input to form and form to body
      form.appendChild(input)
      document.body.appendChild(form)

      // Submit form
      form.submit()

      await nextTick()

      // Clean up
      document.body.removeChild(form)
    } catch (error) {
      console.error(`Error fetching new access token: ${error}`, { error })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    submit,
    isLoading,
  }
}

export default useAuthenticatedDownload
