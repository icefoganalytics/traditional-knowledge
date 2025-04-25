export type VueHtmlClass = string | Record<string, boolean> | (string | Record<string, boolean>)[]

export type SetIntersection<T extends object[]> = {
  [K in keyof T[number]]: K extends keyof T[0] ? Extract<T[number][K], T[number][K]> : never
}
