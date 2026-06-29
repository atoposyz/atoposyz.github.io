import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://atoposyz.github.io/',
  lang: 'zh-CN',
  title: 'Atoposyz',
  subtitle: '生活本就是奇迹与日常的结合体',
  author: {
    name: 'Atoposyz',
    avatar: 'https://raw.githubusercontent.com/atoposyz/atoposyz.github.io/Valaxy-dev/public/atoposyz.jpg',
    status: {
      emoji: '🌸',
      message: '平凡地走下去吧',
    },
    intro: '一枚喜欢二次元与中文VOCALOID的程序员。平凡地走完了小学、初中与高中，即将从吉林大学毕业。',
  },
  description: 'Atoposyz 的个人博客 - 记录 OI 竞赛、数学思考、动漫热爱与生活点滴',
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
  },

  lastUpdated: true,
})