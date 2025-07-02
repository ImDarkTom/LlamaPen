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
                        '--tw-prose-body': 'var(--color-text-muted)',
                        '--tw-prose-headings': 'var(--color-text)',
                        '--tw-prose-lead': 'var(--color-text)',
                        '--tw-prose-links': 'var(--color-secondary)',
                        '--tw-prose-bold': 'var(--color-text-muted)',
                        '--tw-prose-counters': 'var(--color-primary)',
                        '--tw-prose-bullets': 'var(--color-primary)',
                        '--tw-prose-hr': 'var(--color-text-muted)',
                        '--tw-prose-quotes': 'var(--color-text-muted)',
                        '--tw-prose-quote-borders': 'var(--color-text-muted)',
                        '--tw-prose-captions': 'var(--color-text-muted)',
                        '--tw-prose-code': 'var(--color-text-muted)',
                        '--tw-prose-pre-code': 'var(--color-text-muted)',
                        '--tw-prose-pre-bg': 'var(--color-text-muted)',
                        '--tw-prose-th-borders': 'var(--color-text-muted)',
                        '--tw-prose-td-borders': 'var(--color-text-muted)',
                    },
                },
            }),
        }
    },
    plugins: [require("@tailwindcss/typography"), require('tailwindcss-motion')],
}