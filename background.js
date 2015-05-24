
function updateCount(messageCount) {
  if (messageCount <= 0) {
    //chrome.browserAction.setIcon({path: "gmail_not_logged_in.png"});
    chrome.browserAction.setBadgeBackgroundColor({color: [190, 190, 190, 230]});
    chrome.browserAction.setBadgeText({text: messageCount});
  } else {
    //chrome.browserAction.setIcon({path: "gmail_logged_in.png"});
    chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
    chrome.browserAction.setBadgeText({
      text: messageCount
    });
  }


  var notification = (new Date()).getTime();
  chrome.notifications.create("bh-" + notification, {
    type: "basic",
    iconUrl: "imgs/icon-32.png",
    title: chrome.i18n.getMessage('noticeficationTitle'),
    message: chrome.i18n.getMessage('followingUpdateMessage').replace('%n', messageCount),
    isClickable: false
  }, function () {
  })
}

function onAlarm(){
  updateCount("0");
}

function onAlarm1() {
  bkg_page.chrome.cookies.get({
    url: "http://pubu.im",
    name: "express:sess"
  }, function (sess) {
    bkg_page.chrome.cookies.get({
      url: "http://pubu.im",
      name: "express:sess.sig"
    }, function (sig) {
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
        }
      }
      xhr.send();

    });
  });

}

chrome.alarms.create("onAlarm", {
  periodInMinutes: 0.5
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
