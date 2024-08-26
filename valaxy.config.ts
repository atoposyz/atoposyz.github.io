import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from 'valaxy-addon-components'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: 'Atoposyz',
      cloud: {
        enable: true,
      },
    },
    
    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
      {
        name: '喜欢的女孩子',
        url: '/girls/',
        icon: 'i-ri-women-line',
        color: 'hotpink',
      },
      {
        name: '动画高手',
        url: '/anime-grid/',
        icon: 'i-ri-tv-line',
        color: 'pink',
      },
    ],

    footer: {
      since: 2023,
      beian: {
        enable: false,
        icp: '萌ICP备20240313号',
      },
    },
  },
  addons: [
    addonComponents(),
  ],
  unocss: { safelist },
})
