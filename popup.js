



$(document).ready(function () {
  $('#make_all_read').html(chrome.i18n.getMessage('make_all_read'));
  $('#go_pubu').html(chrome.i18n.getMessage('go_pubu'));
  $('#go_check').html(chrome.i18n.getMessage('go_check'));



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
        xhr.open("GET", "https://beta.pubu.im/v1/services/unread_count", true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            console.log("get result ",resp);
            if (!resp) {
              return
            }
            resp =resp.data;
            updateCount(resp.count.toString(), resp);

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


});