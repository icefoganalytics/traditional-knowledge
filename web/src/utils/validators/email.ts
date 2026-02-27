import { isNil, isEmpty } from "lodash"

export function email(value: string | null): boolean | string {
  if (isNil(value) || isEmpty(value)) return true
  if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true

  return "Must be a valid e-mail."
}

export default email
