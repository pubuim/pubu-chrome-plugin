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



function onAlarm() {
  var rest = {
    count: 1,
    value: [
      {
        team: "dev",
        count: 1
      }
    ]
  }
  updateCount(rest.count.toString(), rest);
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
