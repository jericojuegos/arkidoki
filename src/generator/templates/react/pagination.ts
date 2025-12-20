export const PAGINATION_TEMPLATES = {
    simple: `import { Button } from "@wordpress/components";
import type { ComponentProps } from "react";

type WPButtonProps = ComponentProps<typeof Button>;

export interface {{Module}}PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const NavButton = (props: WPButtonProps) => (
    <Button size="small" variant="secondary" {...props} />
);

export const {{Module}}Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: {{Module}}PaginationProps) => {
    if (totalPages <= 1) return null;

    const goTo = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    return (
        <nav className="{{PLUGIN_SLUG}}-pagination" aria-label="Pagination">
            <div className="pagination-controls">
                <NavButton onClick={() => goTo(1)} disabled={currentPage === 1} className="tf-context-wp">
                    First
                </NavButton>

                <NavButton onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </NavButton>

                <span className="page-numbers">
                    Page {currentPage} of {totalPages}
                </span>

                <NavButton
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </NavButton>

                <NavButton
                    onClick={() => goTo(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    Last
                </NavButton>
            </div>
        </nav>
    );
};
`,
    v2: `import React, { useState, useEffect } from 'react';

interface {{Module}}PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export const {{Module}}Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
}: {{Module}}PaginationProps) => {
    const [inputPage, setInputPage] = useState(currentPage.toString());

    // Update input when currentPage changes externally
    useEffect(() => {
        setInputPage(currentPage.toString());
    }, [currentPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPage(e.target.value);
    };

    const handleInputBlur = () => {
        let page = parseInt(inputPage, 10);
        if (isNaN(page)) {
            page = currentPage;
        } else {
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
        }
        setInputPage(page.toString());
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    return (
        <div className="tss-pagination-v2">
            <span className="tss-pagination-v2__count">{totalItems} items</span>

            <div className="tss-pagination-v2__controls">
                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="First Page"
                >
                    <span className="tss-pagination-v2__button-text">«</span>
                </button>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                >
                    <span className="tss-pagination-v2__button-text">‹</span>
                </button>

                <input
                    type="text"
                    className="tss-pagination-v2__button tss-pagination-v2__button--input"
                    value={inputPage}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    aria-label="Current Page"
                />

                <span className="tss-pagination-v2__count">of {totalPages}</span>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                >
                    <span className="tss-pagination-v2__button-text">›</span>
                </button>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last Page"
                >
                    <span className="tss-pagination-v2__button-text">»</span>
                </button>
            </div>
        </div>
    );
};
`,
    v3: `import React from 'react';

export interface {{Module}}PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const {{Module}}Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: {{Module}}PaginationProps) => {
    if (totalPages <= 1) return null;

    // Helper to generate page numbers with ellipsis
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);

        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < totalPages && i > 1) {
                range.push(i);
            }
        }

        range.push(totalPages);

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pages = getPageNumbers();

    return (
        <nav className="tss-pagination">
            <div className="tss-pagination__controls">
                <ul className="tss-pagination__list">
                    <li className="tss-pagination__item">
                        <button
                            className="tss-pagination__button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                    </li>

                    {pages.map((page, index) => (
                        <li key={index} className="tss-pagination__item">
                            {page === '...' ? (
                                <span className="tss-pagination__dots">...</span>
                            ) : (
                                <button
                                    className={\`tss-pagination__button \${
                                        currentPage === page ? 'tss-pagination__button--active' : ''
                                    }\`}
                                    onClick={() => onPageChange(page as number)}
                                >
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}

                    <li className="tss-pagination__item">
                        <button
                            className="tss-pagination__button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};
`
};
