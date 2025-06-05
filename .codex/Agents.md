# Modal State Management Policy

- All modals in this project **must** use a centralized Zustand store for open/close state and for passing modal data.
- Modal data types are defined in `ModalDataMap` and should be strictly type-safe.
- All modals must be registered in a central `modalRegistry`, mapping modal names to their components.
- The app renders modals via a single `ModalManager` component that checks the registry and Zustand store.
- Modal data should always be accessed with `getModalData(name)` from the store, **not** passed via parent props.
- The `useModal` hook should be used everywhere for opening/closing/getting modal data.
- Any local or per-component modal state management is forbidden and should be migrated to the central store.
- Always clean up legacy/unused modal state code after refactoring.
- TypeScript must be enforced for all modal-related code.
- New modals should follow the above pattern, with new entries added to `ModalDataMap` and `modalRegistry`.

# General Coding Guidelines

- Use functional components and hooks.
- Prefer explicit, readable, and type-safe code.
- Remove unused code and keep files tidy.
- All code changes should maintain or improve type safety.
