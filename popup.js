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

  chrome.notifications.onClicked.addListener(function (notificationId) {
    console.log("you clicked :", notificationId)
    if (notificationId) {
      var team = notificationId.split("-")[0];

      chrome.tabs.create({
        url: 'http://' + team + '.pubu.im/'
      });
    } else {
      chrome.tabs.create({
        url: 'http://pubu.im/'
      });
    }
  })


  $('#make_all_read').html(chrome.i18n.getMessage('make_all_read'));
  $('#go_pubu').html(chrome.i18n.getMessage('go_pubu'));
  $('#go_check').html(chrome.i18n.getMessage('go_check'));

  getDynamic();
  adModeFunction("checkAdMode");
  setTimeout(function () {
    $('button').blur();
  }, 500);
  $('#go_pubu').click(function () {
    chrome.tabs.create({
      url: 'http://pubu.im/'
    });
    return false;
  });

  $('#make_all_read').click(function () {
    updateCount("0");
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
            //if (!resp) {
            //  return
            //}
            var rest = {
              count: 1,
              value: [
                {
                  team: "dev",
                  count: 1
                }
              ]
            }
            //todo need new api for get all team unread message count  just call ones
            updateCount(rest.count.toString(), rest);
            console.log("resp : ", resp);
          }
        }
        xhr.send();

      });
    });
  });

  function updateCount(messageCount, results) {
    var color;
    if (messageCount <= 0) {
      color = [190, 190, 190, 230];
    } else {
      color = [208, 0, 24, 255];
      var notification = (new Date()).getTime();
      chrome.notifications.create(results.value[0].team + "-" + notification, {
        type: "list",
        iconUrl: "imgs/icon-32.png",
        title: chrome.i18n.getMessage('noticeficationTitle'),
        message: "",
        items: results.value.map(function (result) {
          return {
            "title": result.team + " :" + chrome.i18n.getMessage('UpdateMessage').replace('%n', result.count),
            "message": ""
          }
        }),
        isClickable: true
      }, function () {
      });
    }

    chrome.browserAction.setBadgeBackgroundColor({color: color});
    chrome.browserAction.setBadgeText({text: messageCount});

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