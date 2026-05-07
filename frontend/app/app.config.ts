export default defineAppConfig({
  ui: {
    colors: {
      primary: 'auric',
      secondary: 'electric',
      neutral: 'slate',
      info: 'nebula',
      warning: 'ember',
      error: 'crimson',
      success: 'verdant',
    },
    // Custom radius tokens for components that need larger corner radius
    radius: {
      panel: '1.8rem', // Large panel radius for settings/profile sections
    },
    // Custom font size tokens
    fontSize: {
      display: '2xl', // ~1.45rem for header brand
      heading: '3xl', // ~1.9rem for section headers
    },
    button: {
      defaultVariants: {
        color: 'neutral',
        variant: 'solid',
        size: 'md',
      },
      slots: {
        base: 'cursor-pointer rounded-full border font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0',
        label: 'text-current',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
      slots: {
        base: 'h-12 rounded-2xl border border-default/70 bg-default/85 px-3.5 text-highlighted placeholder:text-toned/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-primary/45 hover:bg-default/95 focus-visible:border-primary/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 aria-invalid:border-error/70 aria-invalid:ring-2 aria-invalid:ring-error/30',
      },
    },
    select: {
      defaultVariants: {
        color: 'neutral',
        variant: 'subtle',
        size: 'lg',
      },
      variants: {
        size: {
          lg: {
            base: 'px-3.5 py-2 text-base/5 gap-2',
            leading: 'ps-3.5',
            trailing: 'pe-3.5',
          },
        },
      },
      slots: {
        base: 'h-12 relative group inline-flex items-center rounded-2xl border border-default/70 bg-default/85 text-highlighted shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-primary/45 hover:bg-default/95 focus-visible:border-primary/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-75',
      },
    },
    card: {
      slots: {
        root: 'rounded-2xl border border-default/70 bg-elevated/74 shadow-[0_24px_46px_-28px_rgba(0,0,0,0.86)] backdrop-blur-md',
        body: 'p-5 sm:p-6',
      },
    },
    toast: {
      slots: {
        root: 'relative flex gap-3 overflow-hidden rounded-2xl border border-default/70 bg-elevated/95 p-4 shadow-lg backdrop-blur-md focus:outline-none',
        wrapper: 'min-w-0 flex-1 flex flex-col',
        title: 'text-sm font-semibold text-highlighted',
        description: 'mt-1 text-sm text-toned',
        icon: 'mt-0.5 size-5 shrink-0',
        avatar: 'shrink-0',
        avatarSize: '2xl',
        actions: 'mt-2 flex shrink-0 gap-1.5',
        progress: 'absolute inset-x-0 bottom-0',
        close: 'shrink-0',
      },
      variants: {
        color: {
          primary: {
            root: 'border-primary/25 bg-primary/10',
            icon: 'text-primary',
          },
          secondary: {
            root: 'border-secondary/25 bg-secondary/10',
            icon: 'text-secondary',
          },
          success: {
            root: 'border-success/25 bg-success/10',
            icon: 'text-success',
          },
          info: {
            root: 'border-info/25 bg-info/10',
            icon: 'text-info',
          },
          warning: {
            root: 'border-warning/25 bg-warning/10',
            icon: 'text-warning',
          },
          error: {
            root: 'border-error/25 bg-error/10',
            icon: 'text-error',
          },
          neutral: {
            root: 'border-default/70 bg-default/90',
            icon: 'text-highlighted',
          },
        },
        orientation: {
          horizontal: {
            root: 'items-center',
            actions: 'mt-0 items-center',
          },
          vertical: {
            root: 'items-start',
            actions: 'items-start',
          },
        },
      },
      defaultVariants: {
        color: 'neutral',
      },
    },
    badge: {
      defaultVariants: {
        variant: 'soft',
      },
      slots: {
        base: 'rounded-full border border-default/75 font-semibold tracking-[0.14em] uppercase',
      },
    },
    carousel: {
      slots: {
        dots: 'mt-4',
        dot: 'h-1.5 w-6 rounded-full bg-muted transition-all data-[active=true]:w-10 data-[active=true]:bg-primary',
        prev: 'border border-default/70 bg-default/85 text-highlighted hover:bg-default focus-visible:ring-2 focus-visible:ring-primary/45',
        next: 'border border-default/70 bg-default/85 text-highlighted hover:bg-default focus-visible:ring-2 focus-visible:ring-primary/45',
      },
    },
  },
})
