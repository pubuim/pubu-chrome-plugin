var bkg_page = chrome.extension.getBackgroundPage();
var regex1 = /<em class="number">(\d+)<\/em>.*<strong class="title">新消息/g;
var regex = /<em class="number">(\d+)<\/em>/g;
chrome.notifications.onClicked.addListener(function () {
  chrome.tabs.create({
    url: 'https://mp.weixin.qq.com'
  });
});

function onAlarm() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://mp.weixin.qq.com", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var resp = xhr.responseText
      console.log("get result ", resp);
      if (!resp) {
        return notify(-1)
      }

      var match = regex.exec(resp)
      
      console.log(match )
      console.log(resp.match(regex), resp.match(regex1))
      if (!match || !match[1]) {
        return notify(-1)
      }
      console.log("get result ", match[1]);
      notify(match[1]);
    }
  }
  xhr.send();
}


function notify(messageCount, message) {
  var color;
  if (messageCount <= 0) {
    color = [190, 190, 190, 230];
  } else {
    color = [208, 0, 24, 255];
    if (!message) {
      message = messageCount
    }
  }

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
    chrome.notifications.create('background', {
      type: "basic",
      iconUrl: "imgs/icon-32.png",
      title: chrome.i18n.getMessage('noticeficationTitle'),
      message: badgeCount >= 0 ? chrome.i18n.getMessage('updateMessage').replace('%n', badgeCount) : chrome.i18n.getMessage('errorMessage'),
      isClickable: true
    }, function () {});
  }
}

chrome.alarms.create("onAlarm", {
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  switch (alarm.name) {
    case "onAlarm":
      onAlarm();
      return true;
    default:
      return false;
  }
});
onAlarm();
