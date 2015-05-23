var bkg_page = chrome.extension.getBackgroundPage();

function adModeFunction(cmd) {
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, {
      command: cmd,
      css: bkg_page.ad_mode
    }, function (response) {
      if (typeof response !== "undefined") {
        if ((response.mode) == false) $('#ad_mode').html(chrome.i18n.getMessage('adModeOff'));
        else if ((response.mode) == true) $('#ad_mode').html(chrome.i18n.getMessage('adModeOn'));
      }
    })
  });
}

function getDynamic() {
  bkg_page.chrome.cookies.get({
    url: "http://interface.bilibili.com/nav.js",
    //url: "http://pubu.im"
    name: "DedeUserID"

  }, function (cookie) {
    if (cookie === null) $('#go_dynamic').html(chrome.i18n.getMessage('goDynamic') + chrome.i18n.getMessage('notLogged'));
    else if (bkg_page.getOption("updates") > 0) $('#go_dynamic').html(chrome.i18n.getMessage('goDynamic') + '<span class="red">' + chrome.i18n.getMessage('nNewUpdate').replace('%n', bkg_page.getOption("updates")) + '</span>');
    else $('#go_dynamic').html(chrome.i18n.getMessage('goDynamic'));
  });
}

$(document).ready(function () {
  chrome.tabs.getSelected(null, function (tab) {
    if (tab.url.match(/:\/\/(.[^/]+)/)[1] == "www.bilibili.com" || tab.url.match(/:\/\/(.[^/]+)/)[1] == "bilibili.smgbb.cn" || tab.url.match(/:\/\/(.[^/]+)/)[1] == "space.bilibili.com") {
      $("#go_bili").hide();
    } else if (tab.url.match(/:\/\/(.[^/]+)/)[1] == "space.bilibili.com" || tab.url.match(/:\/\/(.[^/]+)/)[1] == "member.bilibili.com") {
      $("#go_bili, #ad_mode").hide();
    } else {
      $("#css_switch,#ad_mode").hide();
    }
  });
  $('#go_bili').html(chrome.i18n.getMessage('goBili'));
  $('#ad_mode').html(chrome.i18n.getMessage('adModeOff'));
  $('#go_video').html(chrome.i18n.getMessage('goVideo'));
  $('#go_option').html(chrome.i18n.getMessage('goOption'));
  $('#go_check').html("检查更新");
  getDynamic();
  adModeFunction("checkAdMode");
  setTimeout(function () {
    $('button').blur();
  }, 500);
  $('#go_bili').click(function () {

    console.log("## Pubu.IM get cookie");
    chrome.tabs.create({
      url: 'http://pubu.im/'
    });
    return false;
  });
  $('#go_dynamic').click(function () {
    bkg_page.chrome.browserAction.setBadgeText({
      text: ""
    });
    bkg_page.setOption("updates", 0);
    chrome.tabs.create({
      url: "http://www.bilibili.com/account/dynamic"
    });
    return false;
  });
  $('#go_option').click(function () {
    chrome.tabs.create({
      url: chrome.extension.getURL('options.html')
    });
    return false;
  });
  $('#go_check').click(function () {
    console.log("test called!")
    bkg_page.chrome.cookies.get({
      url: "http://pubu.im",
      name: "express:sess"
    }, function (sess) {
      bkg_page.chrome.cookies.get({
        url: "http://pubu.im",
        name: "express:sess.sig"
      }, function (sig) {
        console.log("## Pubu.IM get cookie  sess", sess);
        console.log("## Pubu.IM get cookie sig ", sig);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://beta.pubu.im/v1/teams", true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp) {
              return
            }
            var rest = {
              data: 3
            }
            //todo need new api for get all team unread message count  just call ones
            updateCount(rest.data.toString());
            console.log("resp : ", resp);
          }
        }
        xhr.send();

      });
    });
  });

  function updateCount(messageCount) {
    chrome.browserAction.setBadgeText({
      text: messageCount
    });

    var notification = (new Date()).getTime();
    chrome.notifications.create("bh-" + notification, {
      type: "basic",
      iconUrl: "imgs/icon-32.png",
      title: chrome.i18n.getMessage('noticeficationTitle'),
      message: chrome.i18n.getMessage('followingUpdateMessage').replace('%n', 3),
      isClickable: false
    }, function () {
    })
    Console.log("get the massage count +", messageCount);
  }

  $('#ad_mode').click(function () {
    adModeFunction("adMode");
  });
  $('#video_id').keyup(function (e) {
    if (e.keyCode == 13) {
      $('#go_video').click();
    }
  });
  $('#go_video').click(function () {
    var value = $('#video_id').val();
    if (/av[0-9]+/g.test(value)) {
      chrome.tabs.create({
        url: 'http://www.bilibili.com/video/' + value
      });
    } else if (/[0-9]+/g.test(value)) {
      chrome.tabs.create({
        url: 'http://www.bilibili.com/video/av' + value
      });
    } else {
      $('#video_id').val('').focus();
    }
    return false;
  });
});