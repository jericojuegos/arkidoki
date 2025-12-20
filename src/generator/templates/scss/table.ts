export const TABLE_SCSS = `// tgbl-table
// BEM Styling for React Table

.tgbl-table-container {
    width: 100%;
    overflow-x: auto;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tgbl-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;

    &__head {
        background: #f9fafb;
        border-bottom: 2px solid #e2e4e7;
    }

    &__body {
        background: #fff;
    }

    &__row {
        border-bottom: 1px solid #e2e4e7;
        transition: background 0.15s ease;

        &--head {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            color: #6b7280;
        }

        &--body:hover {
            background: #f9fafb;
        }

        &--empty {
            text-align: center;
            color: #9ca3af;
        }
    }

    &__cell {
        padding: 0.75rem 1rem;
        text-align: left;
        vertical-align: middle;

        &--head {
            white-space: nowrap;
        }

        &--body {
            color: #374151;
        }
    }
}

// Status Badge
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    &.status-active,
    &.status-success {
        background: #d1fae5;
        color: #065f46;
    }

    &.status-pending,
    &.status-warning {
        background: #fef3c7;
        color: #92400e;
    }

    &.status-inactive,
    &.status-error {
        background: #fee2e2;
        color: #991b1b;
    }
}
`;
