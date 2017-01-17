var bkg_page = chrome.extension.getBackgroundPage();
var regex = /<em class="number">(\d+)<\/em>\s+<strong class="title">新消息/g;


$(document).ready(function () {
  $('#make_all_read').html(chrome.i18n.getMessage('allRead'));
  $('#go_mp').html(chrome.i18n.getMessage('goMP'));
  $('#check_mp').html(chrome.i18n.getMessage('checkMP'));

  chrome.notifications.onClicked.addListener(function () {
    chrome.tabs.create({
      url: 'https://mp.weixin.qq.com'
    });
  });

  setTimeout(function () {
    $('button').blur();
  }, 500);
  $('#go_mp').click(function () {
    console.log('go_check')
    chrome.tabs.create({
      url: 'https://mp.weixin.qq.com'
    });
    return false;
  });

  $('#make_all_read').click(function () {
    return notify(-1)
  });

  $('#check_mp').click(function () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://mp.weixin.qq.com", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var resp = xhr.responseText
        console.log("get result ", resp);
        if (!resp) {
          return notify(-1,'页面失效，请重新登陆')
        }

        var match = regex.exec(resp)
        console.log(match)
        if (!match || !match[1]) {
         return notify(-1,'页面失效，请重新登陆')
        }
        console.log("get result ", match[1]);
        notify(match[1]);
      }
    }
    xhr.send();
  });

function audioNotification(){
    var yourSound = new Audio('a.mp3');
    yourSound.play();
}

  function notify(messageCount, message) {
    console.log(messageCount)
    var color = [190, 190, 190, 230];
    if (messageCount == 0) {
      message = "暂时没有新消息"
    } else if (messageCount <= -1) {
      messageCount = 0
    } else if (messageCount > 0) {
      color = [208, 0, 24, 255];
      if (!message) {
        message = "有：" + messageCount + "条未读消息"
      }
    }
    console.log(message)
   return createNotification(messageCount, color, message)
  }

  function createNotification(badgeCount, color, message) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
    chrome.browserAction.setBadgeText({
      text: String(badgeCount)
    });

    if (message) {
      chrome.notifications.create('unread ', {
        type: "basic",
        iconUrl: "imgs/icon-32.png",
        title: chrome.i18n.getMessage('noticeficationTitle'),
        message: message,
        isClickable: true
      }, function () {audioNotification()});
    }
  }
});