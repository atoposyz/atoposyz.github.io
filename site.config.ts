import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://atoposyz.github.io/',
  lang: 'zh-CN',
  title: 'atoposyz的博客',
  subtitle: '',
  author: {
    name: 'atoposyz',
    avatar: 'https://raw.githubusercontent.com/atoposyz/atoposyz.github.io/Valaxy-dev/public/atoposyz.jpg',
    status: {
      emoji: '🤣',
      message: '',
    }
  },
  description: '',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/atoposyz',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/69838762',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
  ],

  search: {
    enable: true,
  },

  sponsor: {
    enable: false,
    title: '我很可爱，请给我钱！',
    methods: [
      {
        name: '支付宝',
        url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
    ],
  },
  frontmatter: {
    time_warning: false,
  }
})