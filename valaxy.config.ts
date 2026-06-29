import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from 'valaxy-addon-components'
// import { addonMeting } from 'valaxy-addon-meting'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
  'i-ri-article-line',
  'i-ri-user-line',
  'i-ri-links-line',
  'i-ri-archive-line',
  'i-ri-price-tag-3-line',
  'i-ri-folder-line',
  'i-ri-search-line',
  'i-ri-heart-line',
  'i-ri-cloud-line',
  'i-ri-sakura-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    colors: {
      primary: '#FF6B9D',
    },

    banner: {
      enable: true,
      title: 'Atoposyz',
      cloud: {
        enable: true,
      },
    },

    nav: [
      {
        text: '归档',
        link: '/archives',
        icon: 'i-ri-archive-line',
      },
      {
        text: '分类',
        link: '/categories',
        icon: 'i-ri-folder-line',
      },
      {
        text: '标签',
        link: '/tags',
        icon: 'i-ri-price-tag-3-line',
      },
      {
        text: '关于',
        link: '/about',
        icon: 'i-ri-user-line',
      },
      {
        text: '友链',
        link: '/links',
        icon: 'i-ri-links-line',
      },
    ],

    // say: {
    //   enable: true,
    //   hitokoto: {
    //     enable: true,
    //     api: 'https://v1.hitokoto.cn',
    //   },
    // },

    // fireworks: {
    //   enable: true,
    //   colors: ['#FF6B9D', '#C084FC', '#67E8F9', '#FFB347', '#FF85B3'],
    // },

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
        url: 'https://atoposyz.github.io/AnimeTierList/',
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
        enable: true,
        name: 'i-ri-heart-line',
        animated: true,
        color: '#FF6B9D',
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