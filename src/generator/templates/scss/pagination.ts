export const PAGINATION_SCSS_TEMPLATES = {
    simple: `// {{PLUGIN_SLUG}}-pagination 
// BEM Styling for Simple Pagination

.{{PLUGIN_SLUG}}-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    &__controls {
        display: flex;
        align-items: center;
        gap: 3px;
    }

    &__list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 4px;
    }

    &__button,
    &__nav {
        min-width: 32px;
        padding: 4px 8px;
        cursor: pointer;
    }

    &__button--active {
        font-weight: 600;
        pointer-events: none;
    }

    &__status {
        font-size: 12px;
        opacity: 0.7;
        padding: 0 4px;
    }
}
`,
    v2: `// {{PLUGIN_SLUG}}-pagination-v2
// BEM Styling for V2 Pagination (Input + Arrows)

.{{PLUGIN_SLUG}}-pagination-v2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #fff;
    border-top: 1px solid #e2e4e7;

    &__count {
        font-size: 0.875rem;
        color: #757575;
    }

    &__controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    &__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid #e2e4e7;
        border-radius: 4px;
        background: #fff;
        color: #1e1e1e;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
            background: #f0f0f0;
            border-color: #c4c4c4;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &--input {
            width: 48px;
            text-align: center;
            font-size: 0.875rem;
        }
    }

    &__button-text {
        font-size: 1rem;
        line-height: 1;
    }
}
`,
    v3: `// {{PLUGIN_SLUG}}-pagination-v3
// BEM Styling for V3 Pagination (Numbered)

.{{PLUGIN_SLUG}}-pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;

    &__controls {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    &__list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0 4px;
        gap: 4px;
    }

    &__item {
        display: inline-flex;
    }

    &__button {
        min-width: 32px;
        justify-content: center;

        &--active {
            font-weight: 600;
            pointer-events: none;
        }
    }
}
`
};
