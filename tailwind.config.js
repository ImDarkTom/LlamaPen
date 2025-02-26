/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        pre: false,
                        code: false,
                        'pre code': false,
                        'code::before': false,
                        'code::after': false
                    }
                }
            }
        }
    },
    plugins: [require("@tailwindcss/typography"), require('tailwindcss-motion')],
}