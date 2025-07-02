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
                appdark: {
                    css: {
                        color: 'var(--color-text-muted)',
                        '--tw-prose-body': 'var(--color-text-muted)',
                        '--tw-prose-headings': 'var(--color-text)',
                        '--tw-prose-bold': 'var(--color-text-muted)',
                        '--tw-prose-lead': 'var(--color-text)',
                    }
                }
            }),
        }
    },
    plugins: [require("@tailwindcss/typography"), require('tailwindcss-motion')],
}