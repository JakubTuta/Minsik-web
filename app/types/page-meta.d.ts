declare module '#app' {
  interface PageMeta {
    /**
     * The page emits its own hreflang alternates, so app.vue drops the ones
     * `useLocaleHead()` derives from the current path. See books/[slug].vue.
     */
    ownsLocaleAlternates?: boolean
  }
}

export {}
