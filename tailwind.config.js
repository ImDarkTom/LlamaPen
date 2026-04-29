/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            typography: () => ({
                DEFAULT: {
                    css: {
                        pre: false,
                        code: false,
                        'pre code': false,
                        'code::before': false,
                        'code::after': false
                    }
                },
                app: {
                    css: {
                        '--tw-prose-body': 'var(--color-base-200)',
                        '--tw-prose-headings': 'var(--color-base-100)',
                        '--tw-prose-lead': 'var(--color-base-100)',
                        '--tw-prose-links': 'var(--color-secondary)',
                        '--tw-prose-bold': 'var(--color-base-200)',
                        '--tw-prose-counters': 'var(--color-primary)',
                        '--tw-prose-bullets': 'var(--color-primary)',
                        '--tw-prose-hr': 'var(--color-base-200)',
                        '--tw-prose-quotes': 'var(--color-base-200)',
                        '--tw-prose-quote-borders': 'var(--color-base-200)',
                        '--tw-prose-captions': 'var(--color-base-200)',
                        '--tw-prose-code': 'var(--color-base-200)',
                        '--tw-prose-pre-code': 'var(--color-base-200)',
                        '--tw-prose-pre-bg': 'var(--color-base-200)',
                        '--tw-prose-th-borders': 'var(--color-base-200)',
                        '--tw-prose-td-borders': 'var(--color-base-200)',
                    },
                },
            }),
        }
    },
    plugins: [require("@tailwindcss/typography"), require('tailwindcss-motion')],
}