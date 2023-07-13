import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import './style.css' // Import custom CSS

export default {
  extends: DefaultTheme,
  // You can add enhanceApp or other theme extensions here later if needed
} satisfies Theme
