# Page component design contract

Use this guide when creating or refactoring components rendered by Nuxt in frontend.

## Quick path

1. Put the code in the right layer.
2. Keep the page thin and compose from smaller pieces.

## Component layers

| Layer | Use for | Rule |
| `frontend/app/pages/*` | Routes | Meta, wiring, and composition only. |
| `components/pages/<area>/` | Page-specific sections | Extract any repeated or complex section here. |
| `components/ui/` | Shared composed blocks | Reuse across multiple pages. |
| `components/base/` | Primitives | Small building blocks with minimal opinion. |
| `components/layout/` | App chrome | Header, footer, shell containers. |
| `components/backoffice/` | Admin UI | Backoffice-only forms, filters, and shells. |
| `components/form/` | Form controls | Inputs, selects, field wrappers, validation helpers. |

## Page composition rules

- Page files should stay short.
- Use `useSeoMeta()` and `definePageMeta()` in the page, not inside section components.
- Put business logic in composables or repositories, not in the template.
- Prefer semantic sections: `header`, `main`, `section`, `nav`, `footer`.
- When a page needs 2+ blocks, split them into named section components.

## Naming rules

- `Base*` for primitives.
- `Ui*` for shared feature blocks.
- `Layout*` for shell pieces.
- `Pages<Home|Events|...>*` for page-scoped sections.
- `Backoffice*` for admin-only UI.
- `Form*` for reusable form controls.

## Styling rules

- Use Tailwind scale classes and semantic tokens first.
- Avoid arbitrary values unless there is no clean alternative.
- Keep one-off visual hacks inside reusable components or scoped styles.
- Respect reduced-motion preferences for animations.

## Accessibility rules

- Every interactive control needs a visible focus state.
- Images need meaningful `alt` text or must be decorative.
- Labels must exist for inputs.
- Prefer native elements before custom wrappers.

## Checklist

- [ ] The page file is thin.
- [ ] The component sits in the right layer.
- [ ] The naming matches the existing convention.
- [ ] Styling avoids unnecessary arbitrary values.
- [ ] Accessibility is covered.
