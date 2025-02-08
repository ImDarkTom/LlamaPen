import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
    theme: {
        'primary': '#0d1a30'
    },
    plugins: [
        createThemes({
            dark: {
                'primary': '#0d1a30',
                'secondary': '#192a51',
                'tertiary': '#2a3a6a',
                'quaternary': '#3a4a8a'
            }
        })
    ]
}