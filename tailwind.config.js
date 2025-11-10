// tailwind.config.ts
import typography from '@tailwindcss/typography'
import icons from '@egoist/tailwindcss-icons'
import scrollbar from 'tailwind-scrollbar'
import animate from 'tailwindcss-animate'

export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {},
    },
    plugins: [typography, icons, scrollbar, animate],
}

