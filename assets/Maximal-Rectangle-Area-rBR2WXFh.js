import{_ as E}from"./ValaxyMain.vue_vue_type_style_index_0_lang-2MjlnuVb.js";import{c as g,w as a,f as c,e as d,p,o,g as s,s as i,r as t}from"./app-B2nT23iv.js";import"./YunComment.vue_vue_type_style_index_0_lang-6QdSTzod.js";import"./index-C5okkQwF.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang-Bkdvixtm.js";import"./post-ywNlyiod.js";const w={__name:"Maximal-Rectangle-Area",setup(y,{expose:r}){const n=JSON.parse('{"title":"最大矩形面积","description":"","frontmatter":{"title":"最大矩形面积","date":"2019-08-26 14:44:50","updated":"2019-08-26 14:44:50","katex":true,"tags":["单调栈"],"categories":["题解"]},"headers":[{"level":2,"title":"最大矩形面积","slug":"最大矩形面积","link":"#最大矩形面积","children":[{"level":3,"title":"标程如下","slug":"标程如下","link":"#标程如下","children":[]}]}],"relativePath":"pages/posts/Maximal-Rectangle-Area.md","path":"/home/runner/work/atoposyz.github.io/atoposyz.github.io/pages/posts/Maximal-Rectangle-Area.md","lastUpdated":1729088551000}'),e=d(),h=n.frontmatter||{};return e.meta.frontmatter=Object.assign(e.meta.frontmatter||{},n.frontmatter||{}),p("pageData",n),p("valaxy:frontmatter",h),globalThis.$frontmatter=h,r({frontmatter:{title:"最大矩形面积",date:"2019-08-26 14:44:50",updated:"2019-08-26 14:44:50",katex:!0,tags:["单调栈"],categories:["题解"]}}),(l,k)=>{const m=E;return o(),g(m,{frontmatter:c(h)},{"main-content-md":a(()=>k[0]||(k[0]=[s("h2",{id:"最大矩形面积",tabindex:"-1"},[s("a",{href:"http://oj.ipoweru.cn/problem/22510",target:"_blank",rel:"noreferrer"},"最大矩形面积"),i(),s("a",{class:"header-anchor",href:"#最大矩形面积","aria-label":'Permalink to "[最大矩形面积](http://oj.ipoweru.cn/problem/22510)"'},"​")],-1),s("p",null,[i("题目描述 给出一个柱形统计图，图中有n个项目，它的每个项目的宽度是1， 高度为"),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("msub",null,[s("mi",null,"h"),s("mi",null,"i")])]),s("annotation",{encoding:"application/x-tex"},"h_i")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.8444em","vertical-align":"-0.15em"}}),s("span",{class:"mord"},[s("span",{class:"mord mathnormal"},"h"),s("span",{class:"msupsub"},[s("span",{class:"vlist-t vlist-t2"},[s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.3117em"}},[s("span",{style:{top:"-2.55em","margin-left":"0em","margin-right":"0.05em"}},[s("span",{class:"pstrut",style:{height:"2.7em"}}),s("span",{class:"sizing reset-size6 size3 mtight"},[s("span",{class:"mord mathnormal mtight"},"i")])])]),s("span",{class:"vlist-s"},"​")]),s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.15em"}},[s("span")])])])])])])])]),i("。 求这个柱形图中的最大面积的长方形。")],-1),s("figure",null,[s("img",{src:"https://i.loli.net/2019/08/26/8OcebgIFEK3nJtu.png",alt:"sample.png",loading:"lazy",decoding:"async"})],-1),s("p",null,"输入格式",-1),s("p",null,"从标准输入读入数据。",-1),s("p",null,"输入共两行。",-1),s("p",null,[i("第一行一个正整数 "),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("mi",null,"n"),s("mo",{stretchy:"false"},"("),s("mo",null,"≤"),s("mn",null,"1"),s("msup",null,[s("mn",null,"0"),s("mn",null,"6")]),s("mo",{stretchy:"false"},")")]),s("annotation",{encoding:"application/x-tex"},"n(\\leq 10^6)")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"1em","vertical-align":"-0.25em"}}),s("span",{class:"mord mathnormal"},"n"),s("span",{class:"mopen"},"("),s("span",{class:"mrel"},"≤"),s("span",{class:"mspace",style:{"margin-right":"0.2778em"}})]),s("span",{class:"base"},[s("span",{class:"strut",style:{height:"1.0641em","vertical-align":"-0.25em"}}),s("span",{class:"mord"},"1"),s("span",{class:"mord"},[s("span",{class:"mord"},"0"),s("span",{class:"msupsub"},[s("span",{class:"vlist-t"},[s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.8141em"}},[s("span",{style:{top:"-3.063em","margin-right":"0.05em"}},[s("span",{class:"pstrut",style:{height:"2.7em"}}),s("span",{class:"sizing reset-size6 size3 mtight"},[s("span",{class:"mord mtight"},"6")])])])])])])]),s("span",{class:"mclose"},")")])])]),i("。")],-1),s("p",null,[i("第二行 "),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("mi",null,"n")]),s("annotation",{encoding:"application/x-tex"},"n")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.4306em"}}),s("span",{class:"mord mathnormal"},"n")])])]),i(" 个正整数，第 "),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("mi",null,"i")]),s("annotation",{encoding:"application/x-tex"},"i")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.6595em"}}),s("span",{class:"mord mathnormal"},"i")])])]),i(" 个数为 "),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("msub",null,[s("mi",null,"h"),s("mi",null,"i")])]),s("annotation",{encoding:"application/x-tex"},"h_i")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.8444em","vertical-align":"-0.15em"}}),s("span",{class:"mord"},[s("span",{class:"mord mathnormal"},"h"),s("span",{class:"msupsub"},[s("span",{class:"vlist-t vlist-t2"},[s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.3117em"}},[s("span",{style:{top:"-2.55em","margin-left":"0em","margin-right":"0.05em"}},[s("span",{class:"pstrut",style:{height:"2.7em"}}),s("span",{class:"sizing reset-size6 size3 mtight"},[s("span",{class:"mord mathnormal mtight"},"i")])])]),s("span",{class:"vlist-s"},"​")]),s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.15em"}},[s("span")])])])])])])])]),i("（"),s("span",{class:"katex"},[s("span",{class:"katex-mathml"},[s("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[s("semantics",null,[s("mrow",null,[s("mo",null,"≤"),s("mn",null,"1"),s("msup",null,[s("mn",null,"0"),s("mn",null,"6")])]),s("annotation",{encoding:"application/x-tex"},"\\leq10^6")])])]),s("span",{class:"katex-html","aria-hidden":"true"},[s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.7719em","vertical-align":"-0.136em"}}),s("span",{class:"mrel"},"≤"),s("span",{class:"mspace",style:{"margin-right":"0.2778em"}})]),s("span",{class:"base"},[s("span",{class:"strut",style:{height:"0.8141em"}}),s("span",{class:"mord"},"1"),s("span",{class:"mord"},[s("span",{class:"mord"},"0"),s("span",{class:"msupsub"},[s("span",{class:"vlist-t"},[s("span",{class:"vlist-r"},[s("span",{class:"vlist",style:{height:"0.8141em"}},[s("span",{style:{top:"-3.063em","margin-right":"0.05em"}},[s("span",{class:"pstrut",style:{height:"2.7em"}}),s("span",{class:"sizing reset-size6 size3 mtight"},[s("span",{class:"mord mtight"},"6")])])])])])])])])])]),i("） ，两个数之间用空格隔开。")],-1),s("p",null,"输出格式",-1),s("p",null,"输出到标准输出。",-1),s("p",null,"输出一行，一个数，表示答案。",-1),s("p",null,"样例输入",-1),s("p",null,"7",-1),s("p",null,"2 1 4 5 1 3 3",-1),s("p",null,"样例输出",-1),s("p",null,"8",-1),s("hr",null,null,-1),s("h3",{id:"标程如下",tabindex:"-1"},[i("标程如下 "),s("a",{class:"header-anchor",href:"#标程如下","aria-label":'Permalink to "标程如下"'},"​")],-1),s("div",{class:"language-cpp vp-adaptive-theme"},[s("button",{title:"Copy Code",class:"copy"}),s("span",{class:"lang"},"cpp"),s("pre",{class:"shiki shiki-themes github-light github-dark vp-code"},[s("code",{"v-pre":""},[s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"#include"),s("span",{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"}}," <iostream>")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"#include"),s("span",{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"}}," <cmath>")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"using"),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}}," namespace"),s("span",{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"}}," std"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"int"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," n;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"struct"),s("span",{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"}}," node"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," {"),s("span",{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"}},"//搞个结构体储存h高度l长度")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"    int"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," h, l;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"} s["),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}},"1000005"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"];")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"int"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," h, ans, top, sum;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"}},"//top栈顶元素，ans矩形面积，sum长度累加，h输入当前矩形高度")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"int"),s("span",{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"}}," main"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"() {")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"    cin "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},">>"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," n;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"    for"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," ("),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"int"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," i "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}}," 1"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"; i "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"<="),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," n; i"),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"++"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},") {")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        cin "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},">>"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," h;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        sum "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}}," 0"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";"),s("span",{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"}},"//更新当前长度为0")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"        while"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," (top "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"&&"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," s[top].h "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},">"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," h) {")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"            ans "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"}}," max"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"(s[top].h "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"*"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," (s[top].l "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"+"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," sum), ans);")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"            sum "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"+="),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," s[top].l;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"            top"),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"--"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        }")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"}},"/*如果加入的h不如栈顶h大的话，从栈顶开始往左算最大面积，")]),i(`
`),s("span",{class:"line"}),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"}},"*/")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        top"),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"++"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        s[top].h "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," h;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        s[top].l "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," sum "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"+"),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}}," 1"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"    }")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"    sum "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}}," 0"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"    while"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," (top) {")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        ans "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"="),s("span",{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"}}," max"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"(ans, s[top].h "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"*"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," (s[top].l "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"+"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," sum));")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"        top"),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"--"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"    }")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"    cout "),s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"<<"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}}," ans;")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"}},"    return"),s("span",{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"}}," 0"),s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},";")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"}},"}")])])]),s("button",{class:"collapse"})],-1)])),"main-header":a(()=>[t(l.$slots,"main-header")]),"main-header-after":a(()=>[t(l.$slots,"main-header-after")]),"main-nav":a(()=>[t(l.$slots,"main-nav")]),"main-content":a(()=>[t(l.$slots,"main-content")]),"main-content-after":a(()=>[t(l.$slots,"main-content-after")]),"main-nav-before":a(()=>[t(l.$slots,"main-nav-before")]),"main-nav-after":a(()=>[t(l.$slots,"main-nav-after")]),comment:a(()=>[t(l.$slots,"comment")]),footer:a(()=>[t(l.$slots,"footer")]),aside:a(()=>[t(l.$slots,"aside")]),"aside-custom":a(()=>[t(l.$slots,"aside-custom")]),default:a(()=>[t(l.$slots,"default")]),_:3},8,["frontmatter"])}}};export{w as default};
