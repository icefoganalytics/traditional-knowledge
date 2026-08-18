import GenericStatePolicy from "@/policies/information-sharing-agreements/generic-state-policy"

/**
 * A signed agreement reads and writes exactly like any other non-draft state; the class
 * exists so the state-to-policy mapping stays explicit.
 */
export class SignedStatePolicy extends GenericStatePolicy {}

export default SignedStatePolicy
