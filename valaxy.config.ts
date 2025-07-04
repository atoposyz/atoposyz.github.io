import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from 'valaxy-addon-components'
// import { addonMeting } from 'valaxy-addon-meting'

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
        name: '动画格子',
        url: '/anime-grid/',
        icon: 'i-ri-layout-grid-line',
        color: '#ffc468',
      },
      {
        name: '动画分组',
        url: '/AnimeTierList/',
        icon: 'i-ri-layout-row-fill',
        color: '#b8ff45',
      },
    ],

    footer: {
      since: 2023,
      beian: {
        enable: false,
        icp: '萌ICP备20240313号',
      },
      icon: {
        url: 'https://github.com/atoposyz',
        title: 'Github',
      },
    },
  },
  addons: [
    addonComponents(),
    // addonMeting({
    //   global: true,
    //   /** @see https://github.com/metowolf/MetingJS */
    //   props: {
    //     id: '9095518079',
    //     server: 'netease',
    //     type: 'playlist',
    //   },
    // })
  ],
  unocss: { safelist },
})