var menulist = [
    [{name: "Home", src: "index.html"}],
    [{name: "NEWS", src: ""}, {name: "Week1", src: "docs/week1.html"}, {name: "More", src: "docs/news.html"}],
    [{name: "Documents", src: ""}, {name: "README", src: "docs/readme.html"}, {name: "More", src :""}],
    [{name: "Members", src: "docs/member.html"}],
    [{name: "Things", src: "docs/borrow.html"}],
    [{name: "Online", src: "docs/realtimedata.html"}]
]

var caret = '<span class="caret"></span>'
var presentation_normal = '<li role="presentation">'
var presentation_dropdown = '<li role="presentation" class="dropdown">'
var dropdown_toggle_1 = '<a class="dropdown-toggle" data-toggle="dropdown" href="'
var dropdown_toggle_2 =  '" role="button" aria-haspopup="true" aria-expanded="false">'
var dropdown_menu = '<ul class="dropdown-menu">'
var toptext = `
<div class="container-fluid">
<div class="navbar-header">
    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
        data-target="#collapsed-nav">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
    </button>
    <div class='navbar-brand'>
        小组名-项目名
    </div>
</div>
<div class="collapse navbar-collapse" id="collapsed-nav">
    <ul class="nav navbar-nav">`

function isNormalPage(flag) {
    if(flag == 0) {
        return ""
    } else {
        return "../"
    }
}

function topbar(flag) {
    var text = ""
    for(var i = 0; i < menulist.length; i++) {
        var rlength = menulist[i].length
        if(rlength == 1) {
            text = text + presentation_normal + '<a href="' + isNormalPage(flag) + menulist[i][0].src + '">' + menulist[i][0].name + '</a></li>'
        }
        else {
            text = text + presentation_dropdown + dropdown_toggle_1 + isNormalPage(flag) + menulist[i][0].src + dropdown_toggle_2 + menulist[i][0].name + caret + '</a>' + dropdown_menu
            for(var j = 1; j < rlength; j++) {
                text = text + '<li><a href="' + isNormalPage(flag) + menulist[i][j].src + '">' + menulist[i][j].name + "</a></li>"
            }
            text = text + "</ul></li>"
        }
        
    }
    text = text + `</ul></ul></div></div>`
    console.log(text)
    //document.getElementById("top").innerHTML = text
    document.getElementById("top").innerHTML = toptext + text
}