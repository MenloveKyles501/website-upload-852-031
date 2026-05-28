(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(setupPlayer);
    });

    function setupPlayer(wrapper) {
        var video = wrapper.querySelector('video[data-src]');
        var startButton = wrapper.querySelector('[data-player-start]');
        var message = wrapper.querySelector('[data-player-message]');
        var hlsInstance = null;
        var attached = false;

        if (!video || !startButton) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;
            var src = video.getAttribute('data-src');
            if (!src) {
                setMessage('没有可用的播放地址。');
                return Promise.reject(new Error('Missing video source'));
            }

            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve, reject) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setMessage('视频加载失败，请刷新页面或稍后重试。');
                            reject(new Error('Fatal HLS error'));
                        }
                    });
                });
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return Promise.resolve();
            }

            video.src = src;
            setMessage('当前浏览器可能不支持 HLS，请使用最新版 Chrome、Edge、Firefox 或 Safari。');
            return Promise.resolve();
        }

        function play() {
            setMessage('正在初始化播放源…');
            attachSource().then(function () {
                return video.play();
            }).then(function () {
                wrapper.classList.add('is-playing');
                setMessage('');
            }).catch(function () {
                wrapper.classList.remove('is-playing');
                if (!message || !message.textContent) {
                    setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                }
            });
        }

        startButton.addEventListener('click', play);
        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            wrapper.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
