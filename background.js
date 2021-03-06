const CHANNEL_ID = 'UCv9Edl_WbtbPeURPtFDo-uA',
    INTERVAL = 1000 * 30, // 30 second interval
    DEFAULT_ICON_PATH = './icons/128.png',
    LIVE_ICON_PATH = './icons/128-green.png',
    soundEffect = new Audio('online.mp3');

let currentIconPath = DEFAULT_ICON_PATH;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    var response = {};

    for (var i = 0; i < request.items.length; i++) {
        response[request.items[i]] = JSON.parse(localStorage[request.items[i]]);
    }

    sendResponse({
        data: response,
        BTTVChannels: localStorage['BTTVChannels'],
        disableAvatars: JSON.parse(localStorage['disableAvatars']),
        enableChatColors: JSON.parse(localStorage['enableChatColors']),
        wrongPageWarning: JSON.parse(localStorage['wrongPageWarning'])
    });
});

var showNotification = function () {

    var time = /(..)(:..)/.exec(new Date());
    var hour = time[1] % 12 || 12;
    var period = time[1] < 12 ? 'AM' : 'PM';

    if (JSON.parse(localStorage.isActivated) === true) {
        var notification = new Notification('Live! (' + hour + time[2] + ' ' + period + ')', {
            icon: LIVE_ICON_PATH,
            body: 'Ice Poseidon has started streaming.',
        });
    }

    if (JSON.parse(localStorage.notificationSoundEnabled) === true) {

        if (localStorage.getItem('audio') === null) {

            var defaultSound = new Audio('online.mp3');
            var volume = (localStorage.notificationVolume / 100);

            defaultSound.volume = (typeof volume == 'undefined' ? 0.50 : volume);
            defaultSound.play();

        } else {

            var encodedAudio = localStorage.getItem('audio');
            var arrayBuffer = base64ToArrayBuffer(encodedAudio);

            createSoundWithBuffer(arrayBuffer);
        }
    }

    notification.onclick = function () {
        window.open('https://gaming.youtube.com/ice_poseidon/live')
    }
};

var updateIcon = function () {

    const isLive = JSON.parse(localStorage.isLive) === true;

    const iconPath = isLive ? LIVE_ICON_PATH : DEFAULT_ICON_PATH;

    if (iconPath !== currentIconPath) {
        currentIconPath = iconPath;
        chrome.browserAction.setIcon({
            path: currentIconPath
        });
    }
};

var checkIfLive = function () {

    $.get('http://107.170.95.160/live', function (data) {
        if (data['status'] === true) {
            if (JSON.parse(localStorage.isLive) === false) {
                showNotification();
                localStorage.isLive = true;
            }
        } else {
            localStorage.isLive = false;
        }

        updateIcon();
    });
};

if (window.Notification) {
    setInterval(function () {
        checkIfLive();
    }, INTERVAL);
};

if (!localStorage.isLive) localStorage.isLive = false;
if (!localStorage.isActivated) localStorage.isActivated = true;
if (!localStorage.notificationSoundEnabled) localStorage.notificationSoundEnabled = true;
if (!localStorage.notificationVolume) localStorage.notificationVolume = 50;
if (!localStorage.showRecentTweet) localStorage.showRecentTweet = true;
if (!localStorage.emotesTwitch) localStorage.emotesTwitch = true;
if (!localStorage.emotesBTTV) localStorage.emotesBTTV = true;
if (!localStorage.emotesSub) localStorage.emotesSub = true;
if (!localStorage.BTTVChannels) localStorage.BTTVChannels = 'Ice_Poseidon, MonkaSenpai, graphistrs, trihex, reckful, b0aty, NightDev';
if (!localStorage.disableAvatars) localStorage.disableAvatars = true;
if (!localStorage.enableChatColors) localStorage.enableChatColors = true;
if (!localStorage.wrongPageWarning) localStorage.wrongPageWarning = true;

checkIfLive();