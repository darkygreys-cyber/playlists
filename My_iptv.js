;(function () {
'use strict';
var plugin = {
	компонент: 'my_iptv',
	icon: "<svg height=\"244\" viewBox=\"0 0 260 244\" xmlns=\"http://www.w3.org/2000/svg\" style=\"fill-rule:evenodd;\" fill=\"currentColor\"><path d=\"M259.5 47.5v114c-1.709 14.556-9.375 24.723-23 30.5a2934.377 2934.377 0 0 1-107 1.5c-35.704.15-71.37-.35-107-1.5-13.625-5.777-21.291-15.944-23-30.5v-115c1.943-15.785 10.61-25.951 26-30.5a10815.71 10815.71 0 0 1 208 0c15.857 4.68 24.523 15.18 26 31.5zm-230-13a4963.403 4963.403 0 0 0 199 0c5.628 1.128 9.128 4.462 10.5 10.667 40.667 80 0 120-1.285 5.618-4.785 8.785-10.5 9.5-66 .667-132 .667-198 0-5.715-.715-9.215-3.882-10.5-9.5-.667-40-.667-80 0-120 1.35-5.18 4.517-8.514 9.5-10z\"/><path d=\"M70.5 71.5c17.07-.457 34.07.043 51 1.5 5.44 5.442 5.107 10.442-1 15-5.991.5-11.991.666-18 .5.167 14.337 0 28.671-.5 43-3.013 5.035-7.18 6.202-12.5 3.5a11.529 11.529 0 0 1-3.5-4.5 882.407 882.407 0 0 1-.5-42c-5.676.166-11.343 0-17-.5-4.569-2.541-6.069-6.375-4.5-11.5 1.805-2.326 3.972-3.992 6.5-5zM137.5 73.5c4.409-.882 7.909.452 10.5 4a321.009 321.009 0 0 0 16 30 322.123 322.123 0 0 0 16-30c2,602-3,712 6,102-4,879 10,5-3,5 5,148 3,334 6,314 7,834 3,5 13,5a1306.032 1306,032 0 0 0-22 43c-5,381 6.652-10.715 6.652-16 0a1424.647 1424.647 0 0 0-23-45c-1.691-5.369-.191-9.369 4.5-12zM57.5 207.5h144c7.788 2.242 10,288 7,242 7,5 15a11.532 11.532 0 0 1-4.5 3.5c-50 .667-100 .667-150 0-6.163-3.463-7.496-8.297-4-14.5 2.025-2.064 4.358-3.398 7-4z\"/></svg>",
	имя: 'ipTV'
};
var isSNG = false;
var lists = [];
var curListId = -1;
var defaultGroup = 'Other';
var catalog = {};
var listCfg = {};
var EPG = {};
var layerInterval;
var epgInterval;
var UID = '';

var chNumber = '';
var chTimeout = null;
вар stopRemoveChElement = ложь;
var chPanel = $((
	"<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 9em;right: auto;z-index: 1000;\">\n" +
	" <div class=\"player-info__body\">\n" +
	" <div class=\"player-info__line\">\n" +
	" <div class=\"player-info__name\"> </div>\n" +
	" </div>\n" +
	" </div>\n" +
	"</div>").replace(/PLUGIN/g, plugin.component)
).hide().fadeOut(0);
var chHelper = $((
	"<div class=\"player-info info--visible js-ch-PLUGIN\" style=\"top: 14em;right: auto;z-index: 1000;\">\n" +
	" <div class=\"player-info__body\">\n" +
	" <div class=\"tv-helper\"></div>\n" +
	" </div>\n" +
	"</div>").replace(/PLUGIN/g, plugin.component)
).hide().fadeOut(0);
var epgTemplate = $(('<div id="PLUGIN_epg">\n' +
	'<h2 class="js-epgChannel"></h2>\n' +
	'<div class="PLUGIN-details__program-body js-epgNow">\n' +
	' <div class="PLUGIN-details__program-title">Сейчас</div>\n' +
	' <div class="PLUGIN-details__program-list">' +
	'<div class="PLUGIN-program selector">\n' +
	' <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
	' <div class="PLUGIN-program__body">\n' +
	' <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
	' <div class="PLUGIN-program__progressbar"><div class="PLUGIN-program__progress js-epgProgress" style="width: 50%"></div></div>\n' +
	' </div>\n' +
	'</div>' +
	' </div>\n' +
	' <div class="PLUGIN-program__desc js-epgDesc"></div>'+
	'</div>' +
	'<div class="PLUGIN-details__program-body js-epgAfter">\n' +
	' <div class="PLUGIN-details__program-title">Потом</div>\n' +
	' <div class="PLUGIN-details__program-list js-epgList">' +
	' </div>\n' +
	'</div>' +
	'</div>').replace(/PLUGIN/g, plugin.component)
);
function epgListView(isView) {
	var scroll = $('.' + plugin.component + '.category-full').parents('.scroll');
	if (scroll.length) {
		if (isView) {
			scroll.css({float: "left", width: '70%'});
			scroll.parent().append(epgTemplate);
		} еще {
			scroll.css({float: "none", width: '100%'});
			$('#' + plugin.component + '_epg').remove();
		}
	}
}
var epgItemTeplate = $((
	'<div class="PLUGIN-program selector">\n' +
	' <div class="PLUGIN-program__time js-epgTime">XX:XX</div>\n' +
	' <div class="PLUGIN-program__body">\n' +
	' <div class="PLUGIN-program__title js-epgTitle"> </div>\n' +
	' </div>\n' +
	'</div>').replace(/PLUGIN/g, plugin.component)
);
var chHelpEl = chHelper.find('.tv-helper');
var chNumEl = chPanel.find('.player-info__name');
var encoder = $('<div/>');

function isPluginPlaylist(playlist) {
	return !(!playlist.length || !playlist[0].tv
		|| !playlist[0].plugin || playlist[0].plugin !== plugin.component);
}
Lampa.PlayerPlaylist.listener.follow('select', function(e) {
	if (e.item.plugin && e.item.plugin === plugin.component && Lampa.Player.runas)
		Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
});
function channelSwitch(dig, isChNum) {
	if (!Lampa.Player.opened()) return false;
	вар плейлист = Lampa.PlayerPlaylist.get();
	if (!isPluginPlaylist(playlist)) return false;
	if (!$('body>.js-ch-' + plugin.component).length) $('body').append(chPanel).append(chHelper);
	var cnt = playlist.length;
	var prevChNumber = chNumber;
	chNumber += dig;
	номер вар = parseInt(chNumber);
	if (number && number <= cnt) {
		if (!!chTimeout) clearTimeout(chTimeout);
		stopRemoveChElement = true; // Исправляем удаление элемента в функции обратного вызова при выполнении animate.finish()
		chNumEl.text(playlist[number - 1].title);
		if (isChNum || parseInt(chNumber + '0') > cnt) {
			chHelper.finish().hide().fadeOut(0);
		} еще {
			var help = [];
			var chHelpMax = 9;
			вар start = parseInt (chNumber + '0');
			for (var i = start; i <= cnt && i <= (start + Math.min(chHelpMax, 9)); i++) {
				help.push(encoder.text(playlist[i - 1].title).html());
			}
			chHelpEl.html(help.join('<br>'));
			chHelper.finish().show().fadeIn(0);
		}
		if (number < 10 || isChNum) {
			chPanel.finish().show().fadeIn(0);
		}
		stopRemoveChElement = false;
		var chSwitch = function () {
			var pos = number - 1;
			if (Lampa.PlayerPlaylist.position() !== pos) {
				Lampa.PlayerPlaylist.listener.send('select', {
					плейлист: плейлист,
					позиция: pos,
					элемент: плейлист[поз]
				});
				Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
			}
			chPanel.delay(1000).fadeOut(500,function(){stopRemoveChElement || chPanel.remove()});
			chHelper.delay(1000).fadeOut(500,function(){stopRemoveChElement || chHelper.remove()});
			chNumber = "";
		}
		if (isChNum === true) {
			chTimeout = setTimeout(chSwitch, 1000);
			chNumber = "";
		} else if (parseInt(chNumber + '0') > cnt) {
			// Ещё одна цифра невозможна - переключаем
			chSwitch();
		} еще {
			// Ждем эту цифру или переключаем
			chTimeout = setTimeout(chSwitch, 3000);
		}
	} еще {
		chNumber = prevChNumber;
	}
	вернуть true;
}

var cacheVal = {};

function cache(name, value, timeout) {
	var time = (new Date()) * 1;
	if (!!timeout && timeout > 0) {
		cacheVal[name] = [(time + timeout), value];
		возвращаться;
	}
	if (!!cacheVal[name] && cacheVal[name][0] > time) {
		return cacheVal[name][1];
	}
	удалить (cacheVal[name]);
	возвращаемое значение;
}

var timeOffset = 0;
var timeOffsetSet = false;

function unixtime() {
	return Math.floor((new Date().getTime() + timeOffset)/1000);
}

функция toLocaleTimeString(time) {
	var date = new Date(),
		ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
	время = время || дата.getTime();

	дата = новая дата (время + (офст * 1000 * 60 * 60));
	return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
}

function toLocaleDateString(time) {
	var date = new Date(),
		ofst = parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n',''));
	время = время || дата.getTime();

	дата = новая дата (время + (офст * 1000 * 60 * 60));
	return date.toLocaleDateString();
}

var utils = {
	uid: function() {return UID},
	метка времени: unixtime,
	token: function() {return generateSigForString(Lampa.Storage.field('account_email').toLowerCase())},
	хеш: Lampa.Utils.hash,
	hash36: функция(и) {return (this.hash(s) * 1).toString(36)}
};

function generateSigForString(string {
	var sigTime = unixtime();
	return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime + utils.uid());
}

function strReplace(str, key2val) {
	for (var key in key2val) {
		str = str.replace(
			new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
			key2val[key]
		);
	}
	вернуть строку;
}

function tf(t, format, u, tz) {
	формат = формат || '';
	tz = parseInt(tz || '0');
	var thisOffset = 0;
	thisOffset += tz * 60;
	if (!u) thisOffset += parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n','')) * 60 - new Date().getTimezoneOffset();
	var d = new Date((t + thisOffset) * 6e4);
	var r = {yyyy:d.getUTCFullYear(),MM:('0'+(d.getUTCMonth()+1)).substr(-2),dd:('0'+d.getUTCDate()).substr(-2),HH:('0'+d.getUTCHours()).substr(-2),mm:('0'+d.getUTCMinutes()).substr(-2),ss:('0'+d.getUTCSeconds()).substr(-2),UTF:t*6e4};
	return strReplace(format, r);
}

function prepareUrl(url, epg) {
	var m = [], val = '', r = {start:unixtime,offset:0};
	if (epg && epg.length) {
		r = {
			начало: epg[0] * 60,
			utc: epg[0] * 60,
			конец: (epg[0] + epg[1]) * 60,
			utcend: (epg[0] + epg[1]) * 60,
			смещение: unixtime() - epg[0] * 60,
			длительность: epg[1] * 60,
			сейчас: unixtime,
			lutc: unixtime,
			d: function(m){return strReplace(m[6]||'',{M:epg[1],S:epg[1]*60,h:Math.floor(epg[1]/60),m:('0'+(epg[1] % 60)).substr(-2),s:'00'})},
			b: function(m){return tf(epg[0], m[6], m[4], m[5])},
			e: function(m){return tf(epg[0] + epg[1], m[6], m[4], m[5])},
			n: function(m){return tf(unixtime() / 60, m[6], m[4], m[5])}
		};
	}
	while (!!(m = url.match(/\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/))) {
		if (!!m[2] && typeof r[m[2]] === "function") val = r[m[2]](m);
		else if (!!m[3] && typeof r[m[3]] === "function") val = r[m[3]](m);
		else if (m[6] in r) val = typeof r[m[6]] === "function" ? r[m[6]]() : r[m[6]];
		else if (!!m[2] && typeof utils[m[2]] === "function") val = utils[m[2]](m[6]);
		else if (m[6] in utils) val = typeof utils[m[6]] === "function" ? utils[m[6]]() : utils[m[6]];
		иначе val = m[1];
		url = url.replace(m[0], encodeURIComponent(val));
	}
	возвращаемый URL;
}

function catchupUrl(url, type, source) {
	type = (type || '').toLowerCase();
	источник = источник || '';
	если (!type) {
		если (!!источник) {
			if (source.search(/^https?:\/\//i) === 0) type = 'default';
			else if (source.search(/^[?&/][^/]/) === 0) type = 'append';
			иначе тип = 'default';
		}
		else if (url.indexOf('${') < 0) type = 'shift';
		иначе тип = 'default';
		console.log(plugin.name, 'Автоматическое определение типа перехвата "' + type + '"');
	}
	var newUrl = '';
	switch (type) {
		case 'append':
			если (источник) {
				newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
				перерыв; // так и задумано
			}
		case 'timeshift': // @deprecated
		case 'shift': // + append
			newUrl = (source || url);
			newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
			return newUrl;
		case 'flussonic':
		case 'flussonic-hls':
		case 'flussonic-ts':
		case 'fs':
			// Примеры URL-адресов для потоковой передачи и просмотра в записи
			// трансляция: http://ch01.spr24.net/151/mpegts?token=my_token
			// догонять: http://ch01.spr24.net/151/timeshift_abs-{utc}.ts?token=my_token
			// трансляция: http://list.tv:8888/325/index.m3u8?token=secret
			// догонять: http://list.tv:8888/325/timeshift_rel-{offset:1}.m3u8?token=secret
			// трансляция: http://list.tv:8888/325/mono.m3u8?token=secret
			// догонять: http://list.tv:8888/325/mono-timeshift_rel-{offset:1}.m3u8?token=secret
			// трансляция: http://list.tv:8888/325/live?token=my_token
			// догонялка: http://list.tv:8888/325/{utc}.ts?token=my_token
			возвращаемый URL
				.replace(/\/(video|mono)\.(m3u8|ts)/, '/$1-\${start}-\${duration}.$2')
				.replace(/\/(index|playlist)\.(m3u8|ts)/, '/archive-\${start}-\${duration}.$2')
				.replace(/\/mpegts/, '/timeshift_abs-\${start}.ts')
				;
		случай 'xc':
			// Примеры URL-адресов для потоковой передачи и просмотра в записи
			// трансляция: http://list.tv:8080/my@account.xc/my_password/1477
			// догонять: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.ts
			// трансляция: http://list.tv:8080/live/my@account.xc/my_password/1477.m3u8
			// догонять: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.m3u8
			newUrl = url
				.заменять(
					/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
					'$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
				)
				.заменять(
					/^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
					'$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts'
				)
			;
			перерыв;
		case 'default':
			newUrl = source || url;
			перерыв;
		случай 'отключено':
			вернуть false;
		по умолчанию:
			console.log(plugin.name, 'Ошибка: отсутствует поддержка catchup-type="' + type + '"');
			вернуть false;
	}
	if (newUrl.indexOf('${') < 0) return catchupUrl(newUrl,'shift');
	return newUrl;
}

/* ***********************************
 * Управление плеером с помощью клавишной панели
 * ***********************************
 * Поддержка переключения вариантов (возможно не для всех устройств):
 * - цифровыми клавишами (по номеру канала)
 * - клавишами влево-вправо
 * - слова Pg+ и Pg-
 */
function keydown(e) {
	var code = e.code;
	if (Lampa.Activity.active().component === plugin.component
		&& Lampa.Player.opened()
		&& !$('body.selectbox--open').length
	) {
		вар плейлист = Lampa.PlayerPlaylist.get();
		if (!isPluginPlaylist(playlist)) return;
		var isStopEvent = false;
		var curCh = кэш('curCh') || (Lampa.PlayerPlaylist.position() + 1);
		если (code === 428 || code === 34 // Pg-
			//4 - Samsung orsay
			|| ((код === 37 || код === 4) // слева
				&& !$('.player.tv .panel--visible .focus').length
				&& !$('.player.tv .player-footer.open .focus').length
			)
		) {
			curCh = curCh === 1 ? playlist.length : curCh - 1; // зацикливаем
			cache('curCh', curCh, 1000);
			isStopEvent = channelSwitch(curCh, true);
		} else if (code === 427 || code === 33 // Pg+
			// 5 - Samsung orsay right
			|| ((код === 39 || код === 5) // справа
				&& !$('.player.tv .panel--visible .focus').length
				&& !$('.player.tv .player-footer.open .focus').length
			)
		) {
			curCh = curCh === playlist.length ? 1: курЧ + 1; // зацикливаем
			cache('curCh', curCh, 1000);
			isStopEvent = channelSwitch(curCh, true);
		} else if (code >= 48 && code <= 57) { // numpad
			isStopEvent = channelSwitch(code - 48);
		} else if (code >= 96 && code <= 105) { // numpad
			isStopEvent = channelSwitch(code - 96);
		}
		//29460 - Samsung orsay
		if (code === 38 || code === 29460) { // Controller.move('up')
			// this.selectGroup();
			// isStopEvent = true;
		}
		if (isStopEvent) {
			e.event.preventDefault();
			e.event.stopPropagation();
		}
	}
}

function bulkWrapper(func, bulk) {
	var bulkCnt = 1, timeout = 1, queueEndCallback, queueStepCallback, emptyFn = function(){};
	if (typeof bulk === 'object') {
		timeout = bulk.timeout || timeout;
		queueStepCallback = bulk.onBulk || emptyFn;
		queueEndCallback = bulk.onEnd || emptyFn;
		bulkCnt = bulk.bulk || bulkCnt;
	} else if (typeof bulk === 'number') {
		bulkCnt = bulk;
		if (typeof arguments[2] === "number") timeout = arguments[2];
	} else if (typeof bulk === 'function') {
		queueStepCallback = bulk;
		if (typeof arguments[2] === "number") bulkCnt = arguments[2];
		if (typeof arguments[3] === "number") timeout = arguments[3];
	}
	Если bulkCnt < 1, то bulkCnt = 1;
	if (typeof queueEndCallback !== 'function') queueEndCallback = emptyFn;
	if (typeof queueStepCallback !== 'function') queueStepCallback = emptyFn;
	var context = this;
	var queue = [];
	переменный интервал;
	var cnt = 0;
	var runner = function() {
		if (!!queue.length && !interval) {
			интервал = setInterval(
				функция() {
					var i = 0;
					while (queue.length && ++i <= bulkCnt) func.apply(context, queue.shift());
					i = queue.length ? i : i-1;
					cnt += i;
					queueStepCallback.apply(context, [i, cnt, queue.length])
					if (!queue.length) {
						clearInterval(interval);
						интервал = null;
						queueEndCallback.apply(context, [i, cnt, queue.length]);
					}
				},
				таймаут || 0
			);
		}
	}
	return function() {
		queue.push(arguments);
		runner();
	}
}

function getEpgSessCache(epgId, t) {
	var key = getEpgSessKey(epgId);
	var epg = sessionStorage.getItem(key);
	если (epg) {
		epg = JSON.parse(epg);
		если (t) {
			если (epg.length
				&& (
					t < epg[0][0]
					|| t > (epg[epg.length - 1][0] + epg[epg.length - 1][1])
				)
			) возвращает false;
			while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
		}
	}
	вернуть epg;
}
function setEpgSessCache(epgId, epg) {
	var key = getEpgSessKey(epgId);
	sessionStorage.setItem(key, JSON.stringify(epg));
}
function getEpgSessKey(epgId) {
	return ['epg', epgId].join('\t');
}
function networkSilentSessCache(url, success, fail, param) {
	var context = this;
	var urlForKey = url.replace(/([&?])sig=[^&]+&?/, '$1');
	var key = ['cache', urlForKey, param ? utils.hash36(JSON.stringify(param)) : ''].join('\t');
	данные var = sessionStorage.getItem(ключ);
	если (данные) {
		data = JSON.parse(data);
		if (data[0]) typeof success === 'function' && success.apply(context, [data[1]]);
		иначе typeof fail === 'function' && fail.apply(context, [data[1]]);
	} еще {
		вар сеть = новый Lampa.Reguest();
		network.silent(
			URL,
			функция (данные) {
				sessionStorage.setItem(key, JSON.stringify([true, data]));
				typeof success === 'function' && success.apply(context, [data]);
			},
			функция (данные) {
				sessionStorage.setItem(key, JSON.stringify([false, data]));
				typeof fail === 'function' && fail.apply(context, [data]);
			},
			параметр
		);
	}
}

//Стиль
Lampa.Template.add(plugin.component + '_style', '<style>#PLUGIN_epg{margin-right:1em}.PLUGIN-program__desc{font-size:0.9em;margin:0.5em;text-align:justify;max-height:15em;overflow:hidden;}.PLUGIN.category-full{padding-bottom:10em}.PLUGIN div.card__view{position:relative;background-color:#353535;background-color:#353535a6;border-radius:1em;cursor:pointer;padding-bottom:60%}.PLUGIN.square_icons div.card__view{padding-bottom:100%}.PLUGIN img.card__img,.PLUGIN div.card__img{background-color:unset;border-radius:unset;max-height:100%;max-width:100%;height:auto;width:auto;position:absolute;top:50%;left:50%;-moz-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);font-size:2em}.PLUGIN.contain_icons img.card__img{height:95%;width:95%;object-fit:contain}.PLUGIN .card__title{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.PLUGIN .js-layer--hidden{visibility: hidden}.PLUGIN .js-layer--visible{visibility: visible}.PLUGIN .card__age{padding:0;border:1px #3e3e3e solid;margin-top:0.3em;border-radius:0.3em;position:relative;display: none}.PLUGIN .card__age .card__epg-progress{position:absolute;background-color:#3a3a3a;top:0;left:0;width:0%;max-width:100%;height:100%}.PLUGIN .card__age .card__epg-title{position:relative;padding:0.4em 0.2em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}.PLUGIN.category-full .card__icons {top:0.3em;right:0.3em;justify-content:right;}#PLUGIN{float:right;padding: 1.2em 0;width: 30%;}.PLUGIN-details__group{font-size:1.3em;margin-bottom:.9em;opacity:.5}.PLUGIN-details__title{font-size:4em;font-weight:700}.PLUGIN-details__program{padding-top:4em}.PLUGIN-details__program-title{font-size:1.2em;padding-left:4.9em;margin-top:1em;margin-bottom:1em;opacity:.5}.PLUGIN-details__program-list>div+div{margin -top:1em}.PLUGIN-details__program>div+div{margin-top:2em}.PLUGIN-program{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;font-size:1.2em;font-weight:300}.PLUGIN-program__time{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:5em;position:relative}.PLUGIN-program.focus .PLUGIN-program__time::after{content:\'\';position:absolute;top:.5em;right:.9em;width:.4em;background-color:#fff;height:.4em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;margin-top:-0.1em;font-size:1.2em}.PLUGIN-program__progressbar{width:10em;height:0.3em;border:0.05em solid #fff;border-radius:0.05em;margin:0.5em 0.5em 0 0}.PLUGIN-program__progress{height:0.25em;border:0.05em solid #fff;background-color:#fff;max-width: 100%}.PLUGIN .card__icon.icon--timeshift{background-image:url(https://epg.rootu.top/img/icon/timeshift.svg);}</style>'.replace(/PLUGIN/g, plugin.component));
$('body').append(Lampa.Template.get(plugin.component + '_style', {}, true));

function pluginPage(object) {
	if (object.id !== curListId) {
		каталог = {};
		listCfg = {};
		curListId = object.id;
	}
	EPG = {};
	var epgIdCurrent = '';
	var epgPath = '';
	var Favorite = getStorage('favorite' + object.id, '[]');
	вар сеть = новый Lampa.Reguest();
	var прокрутка = новый Lampa.Scroll({
		маска: true,
		над: правда,
		шаг: 250
	});
	// var items = [];
	var html = $('<div></div>');
	var body = $('<div class="' + plugin.component + ' category-full"></div>');
	body.toggleClass('square_icons', getSettings('square_icons'));
	body.toggleClass('contain_icons', getSettings('contain_icons'));
	var info;
	var last;
	if (epgInterval) clearInterval(epgInterval);
	epgInterval = setInterval(function() {
		for (var epgId in EPG) {
			epgRender(epgId);
		}
	}, 10000);

	var layerCards, layerMinPrev = 0, layerMaxPrev = 0, layerFocusI = 0, layerCnt = 24;
	if (layerInterval) clearInterval(layerInterval);
	layerInterval = setInterval(function() {
		если (!layerCards) return;
		var minI = Math.max(layerFocusI - layerCnt, 0);
		var maxI = Math.min(layerFocusI + layerCnt, layerCards.length - 1);
		if (layerMinPrev > maxI || layerMaxPrev < minI) {
			layerCards.slice(layerMinPrev, layerMaxPrev + 1).removeClass('js-layer--visible');
			cardsEpgRender(layerCards.slice(minI, maxI + 1).addClass('js-layer--visible'));
		} еще {
			if (layerMinPrev < minI) layerCards.slice(layerMinPrev, minI + 1).removeClass('js-layer--visible');
			if (layerMaxPrev > maxI) layerCards.slice(maxI, layerMaxPrev + 1).removeClass('js-layer--visible');
			if (layerMinPrev > minI) cardsEpgRender(layerCards.slice(minI, layerMinPrev + 1).addClass('js-layer--visible'));
			if (layerMaxPrev < maxI) cardsEpgRender(layerCards.slice(layerMaxPrev, maxI + 1).addClass('js-layer--visible'));
		}
		layerMinPrev = minI;
		layerMaxPrev = maxI;

	}, 50);
	this.create = function () {
		var _this = this;
		this.activity.loader(true);
		var emptyResult = function () {
			var empty = new Lampa.Empty();
			html.append(empty.render());
			_this.start = empty.start;
			_this.activity.loader(false);
			_this.activity.toggle();
		};
		if (Object.keys(catalog).length) {
			_this.build(catalog);
		} else if(!lists[object.id] || !object.url) {
			emptyResult();
			возвращаться;
		} еще {
			var load = 1, data;
			var compileList = function (dataList) {
				data = dataList;
				if (!--load) parseListHeader();
			};
			if (!timeOffsetSet) {
				загрузка++;
				(функция () {
					var ts = new Date().getTime();
					network.silent(Lampa.Utils.protocol() + 'epg.rootu.top/api/time',
						функция (serverTime) {
							var te = new Date().getTime();
							timeOffset = (serverTime < ts || serverTime > te) ? serverTime - te : 0;
							timeOffsetSet = true;
							compileList(data);
						},
						функция () {
							timeOffsetSet = true;
							compileList(data);
						}
					);
				})();
			}
			вар parseListHeader = функция () {
				если (typeof data != 'string')
					|| data.substr(0, 7).toUpperCase() !== "#EXTM3U"
				) {
					emptyResult();
					возвращаться;
				}
				var m, mm, channelsUri = 'channels';
				var l = data.split(/\r?\n/, 2)[0];
				if (!!(m = l.match(/([^\s=]+)=((["'])(.*?)\3|\S+)/g))) {
					// listCfg
					for (var jj = 0; jj < m.length; jj++) {
						if (!!(mm = m[jj].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/))) {
							listCfg[mm[1].toLowerCase()] = mm[4] || (mm[3] ? '' : mm[2]);
						}
					}
				}
				listCfg['epgUrl'] = listCfg['url-tvg'] || listCfg['x-tvg-url'] || '';
				listCfg['epgCode'] = utils.hash36(listCfg['epgUrl'].toLowerCase().replace(/https:\/\//g, 'http://'));
				console.log(plugin.name, 'epgCode', listCfg['epgCode']);
				/* epg.it999.ru epgCode [def epg2.xml.gz epg.xml.gz epg2.xml epg2xml ru2.xml.gz ru.xml.gz] */
				listCfg['isEpgIt999'] = ["0", "4v7a2u", "skza0s", "oj8j5z", "sab9bx", "rv7awh", "2blr83"].indexOf(listCfg['epgCode']) >= 0;
				listCfg['isYosso'] = ["godxcd"].indexOf(listCfg['epgCode']) >= 0;
				if (/^https?:\/\/.+/i.test(listCfg['epgUrl']) && listCfg['epgUrl'].length < 8000) {
					channelsUri = listCfg['epgCode'] + '/' + channelsUri + '?url=' + encodeURIComponent(listCfg['epgUrl'])
						+ '&uid=' + utils.uid() + '&sig=' + generateSigForString(listCfg['epgUrl']);
				}
				listCfg['epgApiChUrl'] = Lampa.Utils.protocol() + 'epg.rootu.top/api/' + channelsUri;
				networkSilentSessCache(listCfg['epgApiChUrl'], parseList, parseList);
			}
			var parseList = function () {
				если (typeof data != 'string')
					|| data.substr(0, 7).toUpperCase() !== "#EXTM3U"
				) {
					emptyResult();
					возвращаться;
				}
				каталог = {
					'': {
						title: langGet('favorites'),
						setEpgId: false,
						каналы: []
					}
				};
				lists[object.id].groups = [{
					title: langGet('favorites'),
					ключ: ''
				}];
				var l = data.split(/\r?\n/);
				var cnt = 0, i = 1, chNum = 0, m, mm, defGroup = defaultGroup, chInGroupCnt = {}, maxChInGroup = getSettings('max_ch_in_group');
				while (i < l.length) {
					chNum = cnt + 1;
					var channel = {
						ChNum: chNum,
						Название: "Ch " + chNum,
						isYouTube: false,
						URL: '',
						Группа: '',
						Параметры: {}
					};
					for (; cnt < chNum && i < l.length; i++) {
						if (!!(m = l[i].match(/^#EXTGRP:\s*(.+?)\s*$/i))
							&& m[1].trim() !== ''
						) {
							defGroup = m[1].trim();
						} else if (!!(m = l[i].match(/^#EXTINF:\s*-?\d+(\s+\S.*?\s*)?,(.+)$/i))) {
							channel.Title = m[2].trim();
							если (!!m[1]
								&& !!(m = m[1].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/g))
							) {
								for (var j = 0; j < m.length; j++) {
									if (!!(mm = m[j].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/))) {
										channel[mm[1].toLowerCase()] = mm[4] || (mm[3] ? '' : mm[2]);
									}
								}
							}
						} else if (!!(m = l[i].match(/^#EXTVLCOPT:\s*([^\s=]+)=(.+)$/i))) {
							channel.Options[m[1].trim().toLowerCase()] = m[2].trim();
						}
						// else if (!!(m = l[i].match(/^(https?|udp|rt[ms]?p|mms|acestream):\/\/(.+)$/i))) {
						else if (!!(m = l[i].match(/^(https?):\/\/(.+)$/i))) {
							channel.Url = m[0].trim();
							channel.isYouTube = !!(m[2].match(/^(www\.)?youtube\.com/));
							channel.Group = (channel['group-title'] || defGroup) + "";
							cnt++;
						}
					}
					if (!!channel.Url && !channel.isYouTube) {
						chInGroupCnt[channel.Group] = (chInGroupCnt[channel.Group] || 0) + 1;
						var groupPage = maxChInGroup ? Math.floor((chInGroupCnt[channel.Group] - 1) / maxChInGroup) : 0;
						if (groupPage) channel.Group += ' #' + (groupPage + 1);
						if (!catalog[channel.Group]) {
							каталог[канал.Группа] = {
								заголовок: channel.Group,
								setEpgId: false,
								каналы: []
							};
							lists[object.id].groups.push({
								заголовок: channel.Group,
								ключ: канал.Группа
							});
						}
						channel['Title'] = channel['Title'].replace(/\s+(\s|ⓢ|ⓖ|ⓥ|ⓞ|Ⓢ|Ⓖ|Ⓥ|Ⓞ)/g, ' ').trim();
						catalog[channel.Group].channels.push(channel);
						var favI = favorite.indexOf(favID(channel.Title));
						if (favI !== -1) {
							catalog[''].channels[favI] = channel;
						}
					}
				}
				for (i = 0; i < lists[object.id].groups.length; i++) {
					var group = lists[object.id].groups[i];
					group.title += ' [' + catalog[group.key].channels.length + ']';
				}
				for (i = 0; i < favorite.length; i++) {
					if (!catalog[''].channels[i]) {
						каталог[''].каналы[i] = {
							Номер канала: -1,
							Заголовок: "#" + favorite[i],
							isYouTube: false,
							URL: Lampa.Utils.protocol() + 'epg.rootu.top/empty/_.m3u8',
							Группа: '',
							Параметры: {},
							'tvg-logo': Lampa.Utils.protocol() + 'epg.rootu.top/empty/_.gif'
						};
					}
				}
				_this.build(catalog);
			}
			var listUrl = prepareUrl(object.url);
			network.native(
				listUrl,
				compileList,
				функция () {
					// Возможно ошибка из-за CORS запускаем тихий запрос через прокси CORS
					network.silent(
						Lampa.Utils.protocol() + 'epg.rootu.top/cors.php?url=' + encodeURIComponent(listUrl)
						+ '&uid=' + utils.uid() + '&sig=' +generateSigForString(listUrl),
						compileList,
						emptyResult,
						ЛОЖЬ,
						{dataType: 'text'}
					);
				},
				ЛОЖЬ,
				{dataType: 'text'}
			)
		}
		return this.render();
	};
	function epgUpdateData(epgId) {
		var lt = Math.floor(unixtime()/60);
		var t = Math.floor(lt/60), ed, ede;
		if (!!EPG[epgId] && t >= EPG[epgId][0] && t <= EPG[epgId][1]) {
			ed = EPG[epgId][2];
			if (!ed || !ed.length || ed.length >= 3) return;
			ede = ed[ed.length - 1];
			lt = (ede[0] + ede[1]);
			var t2 = Math.floor(lt / 60);
			if ((t2 - t) > 6 || t2 <= EPG[epgId][1]) return;
			t = t2;
		}
		if (!!EPG[epgId]) {
			ed = EPG[epgId][2];
			if (typeof ed !== 'object') return;
			if (ed.length) {
				ede = ed[ed.length - 1];
				lt = (ede[0] + ede[1]);
				var t3 = Math.max(t, Math.floor(lt / 60));
				if (t < t3 && ed.length >= 3) return;
				t = t3;
			}
			EPG[epgId][1] = t;
		} еще {
			EPG[epgId] = [t, t, false];
		}
		var success = function(epg) {
			если (EPG[epgId][2] === false) EPG[epgId][2] = [];
			for (var i = 0; i < epg.length; i++) {
				if (lt < (epg[i][0] + epg[i][1])) {
					EPG[epgId][2].push.apply(EPG[epgId][2], epg.slice(i));
					перерыв;
				}
			}
			setEpgSessCache(epgId + epgPath, EPG[epgId][2]);
			epgRender(epgId);
		};
		var fail = function () {
			если (EPG[epgId][2] === false) EPG[epgId][2] = [];
			setEpgSessCache(epgId + epgPath, EPG[epgId][2]);
			epgRender(epgId);
		};
		if (EPG[epgId][2] === false) {
			var epg = getEpgSessCache(epgId + epgPath, lt);
			if (!!epg) return success(epg);
		}
		network.silent(
			Lampa.Utils.protocol() + 'epg.rootu.top/api' + epgPath + '/epg/' + epgId + '/hour/' + t,
			успех,
			неудача
		);
	}
	function cardsEpgRender(cards) {
		cards.filter('.js-epgNoRender[data-epg-id]').each(function(){epgRender($(this).attr('data-epg-id'))});
	}
	function epgRender(epgId) {
		var epg = (EPG[epgId] || [0, 0, []])[2];
		var card = body.find('.js-layer--visible[data-epg-id="' + epgId + '"]').removeClass('js-epgNoRender');
		if (epg === false || !card.length) return;
		var epgEl = card.find('.card__age');
		if (!epgEl.length) return;
		var t = Math.floor(unixtime() / 60), enableCardEpg = false, i = 0, e, p, cId, cIdEl;
		while (epg.length && t >= (epg[0][0] + epg[0][1])) epg.shift();
		if (epg.length) {
			e = epg[0];
			если (t >= e[0] && t < (e[0] + e[1])) {
				i++;
				enableCardEpg = true;
				p = Math.round((unixtime() - e[0] * 60) * 100 / (e[1] * 60 || 60));
				cId = e[0] + '_' +epgEl.length;
				cIdEl = epgEl.data('cId') || '';
				if (cIdEl !== cId) {
					epgEl.data('cId', cId);
					epgEl.data('progress', p);
					epgEl.find('.js-epgTitle').text(e[2]);
					epgEl.find('.js-epgProgress').css('width', p + '%');
					epgEl.show();
				} else if (epgEl.data('progress') !== p) {
					epgEl.data('progress', p);
					epgEl.find('.js-epgProgress').css('width', p + '%');
				}
			}
		}
		if (epgIdCurrent === epgId) {
			var ec = $('#' + plugin.component + '_epg');
			var epgNow = ec.find('.js-epgNow');
			cId = epgId + '_' + epg.length + (epg.length ? '_' + epg[0][0] : '');
			cIdEl = ec.data('cId') || '';
			if (cIdEl !== cId) {
				ec.data('cId', cId);
				var epgAfter = ec.find('.js-epgAfter');
				если (i) {
					вар slt = toLocaleTimeString(e[0] * 60000);
					var elt = toLocaleTimeString((e[0] + e[1]) * 60000);
					epgNow.data('progress', p);
					epgNow.find('.js-epgProgress').css('width', p + '%');
					epgNow.find('.js-epgTime').text(slt);
					epgNow.find('.js-epgTitle').text(e[2]);
					вар описание = е [3] ? ('<p>' + encoder.text(e[3]).html() + '</p>') : '';
					epgNow.find('.js-epgDesc').html(desc.replace(/\n/g,'</p><p>'));
					epgNow.show();
					info.find('.info__create').html(slt + '-' + elt + ' • ' + encoder.text(e[2]).html());
				} еще {
					info.find('.info__create').html('');
					epgNow.hide();
				}
				if (epg.length > i) {
					var list = epgAfter.find('.js-epgList');
					list.empty();
					var iEnd = Math.min(epg.length, 8);
					for (; i < iEnd; i++) {
						e = epg[i];
						var item = epgItemTeplate.clone();
						item.find('.js-epgTime').text(toLocaleTimeString(e[0] * 60000));
						item.find('.js-epgTitle').text(e[2]);
						list.append(item);
					}
					epgAfter.show();
				} еще {
					epgAfter.hide();
				}
			} else if (i && epgNow.data('progress') !== p) {
				epgNow.data('progress', p);
				epgNow.find('.js-epgProgress').css('width', p + '%');
			}
		}
		if (!enableCardEpg) epgEl.hide();
		if (epg.length < 3) epgUpdateData(epgId);
	}
	this.append = function (data) {
		var catEpg = [];
		var chIndex = 0;
		var _this2 = this;
		var lazyLoadImg = ('loading' in HTMLImageElement.prototype);
		layerCards = null;
		var bulkFn = bulkWrapper(function (channel) {
				var chI = chIndex++;
				var card = Lampa.Template.get('card', {
					заголовок: channel.Title,
					release_year: ''
				});
				card.addClass('card--collection')
					.removeClass('layer--visible')
					.removeClass('layer--render')
					.addClass('js-layer--hidden')
				;
				if (chI < layerCnt) card.addClass('js-layer--visible');
				var img = card.find('.card__img')[0];
				if (lazyLoadImg) img.loading = (chI < 18 ? 'eager' : 'lazy');
				img.onload = function () {
					card.addClass('card--loaded');
				};
				img.onerror = function (e) {
					var name = channel.Title
						.replace(/\s+\(([+-]?\d+)\)/, ' $1').replace(/[-.()\s]+/g, ' ').replace(/(^|\s+)(TV|ТВ)(\s+|$)/i, '$3');
					var fl = name.replace(/\s+/g, '').length > 5
						? name.split(/\s+/).map(function(v) {return v.match(/^(\+?\d+|[UF]?HD|4K)$/i) ? v : v.substring(0,1).toUpperCase()}).join('').substring(0,6)
						: name.replace(/\s+/g, '')
					;
					fl = fl.replace(/([UF]?HD|4k|\+\d+)$/i, '<sup>$1</sup>');
					var hex = (Lampa.Utils.hash(channel.Title) * 1).toString(16);
					while (hex.length < 6) hex+=hex;
					hex = hex.substring(0,6);
					var r = parseInt(hex.slice(0, 2), 16),
						g = parseInt(hex.slice(2, 4), 16),
						b = parseInt(hex.slice(4, 6), 16);
					var hexText = (r * 0,299 + g * 0,587 + b * 0,114) > 186 ? '#000000' : '#FFFFFF';
					card.find('.card__img').replaceWith('<div class="card__img">' + fl + '</div>');
					card.find('.card__view').css({'background-color': '#' + hex, 'color': hexText});
					channel['tvg-logo'] = '';
					card.addClass('card--loaded');
				};
				if (channel['tvg-logo']) img.src = channel['tvg-logo'];else img.onerror();
				var favIcon = $('<div class="card__icon icon--book hide"></div>');
				card.find('.card__icons-inner').append(favIcon);
				var tvgDay = parseInt(
					канал['догоняющие дни'] || канал['tvg-rec'] || канал['timeshift']
					|| listCfg['catchup-days'] || listCfg['tvg-rec'] || listCfg['timeshift']
					|| '0' // что нужно внести в настройки?
				);
				if (parseInt('catchup-enable' inchannel ?channel['catchup-enable'] : tvgDay) > 0) {
					card.find('.card__icons-inner').append('<div class="card__icon icon--timeshift"></div>');
					если (tvgDay === 0) tvgDay = 1;
				} еще {
					tvgDay = 0;
				}
				card.find('.card__age').html('<div class="card__epg-progress js-epgProgress"></div><div class="card__epg-title js-epgTitle"></div>')
				if (object.currentGroup !== '' && favorite.indexOf(favID(channel.Title)) !== -1) {
					favIcon.toggleClass('hide', false);
				}
				card.playThis = function(){
					layerFocusI = chI;
					var video = {
						заголовок: channel.Title,
						url: prepareUrl(channel.Url),
						плагин: plugin.component,
						iptv: true,
						ТВ: правда
					};
					var playlist = [];
					вар playlistForExtrnalPlayer = [];
					var i = 0;
					data.forEach(function (elem) {
						// Изменяем порядок внешнего плейлиста (плейлист начинается с текущего элемента)
						var j = i < chI ? data.length - chI + i : i - chI;
						вар videoUrl = я === chI ? видео.url: подготовитьUrl(elem.Url);
						playlistForExtrnalPlayer[j] = {
							заголовок: elem.Title,
							url: videoUrl,
							iptv: true,
							ТВ: правда
						};
						плейлист.push({
							заголовок: ++i + '. ' + elem.Title,
							url: videoUrl,
							плагин: plugin.component,
							iptv: true,
							ТВ: правда
						});
					});
					video['playlist'] = playlistForExtrnalPlayer;
					Lampa.Keypad.listener.destroy()
					Lampa.Keypad.listener.follow('keydown', keydown.bind(_this2));
					Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
					Lampa.Player.play(video);
					Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
					Lampa.Player.playlist(playlist);
				};
				card.on('hover:focus hover:hover touchstart', function (event) {
					layerFocusI = chI;
					if (event.type && event.type !== 'touchstart' && event.type !== 'hover:hover') scroll.update(card, true);
					last = card[0];
					// info.find('.info__title-original').text(channel['Group']);
					info.find('.info__title').text(channel.Title);
					var ec = $('#' + plugin.component + '_epg');
					ec.find('.js-epgChannel').text(channel.Title);
					if (!channel['epgId']) {
						info.find('.info__create').empty();
						epgIdCurrent = '';
						ec.find('.js-epgNow').hide();
						ec.find('.js-epgAfter').hide();
					}
					еще {
						epgIdCurrent = channel['epgId'];
						epgRender(channel['epgId']);
					}
				}).on('hover:enter', function() {
					getStorage('launch_menu', 'false') ? card.trigger('hover:long') : card.playThis();
				}).on('hover:long', function () {
					layerFocusI = chI;
					var favI = favorite.indexOf(favID(channel.Title));
					var isFavoriteGroup = object.currentGroup === '';
					var menu = [];


					if (getStorage('launch_menu', 'false')) {
						menu.push({
							title: Lampa.Lang.translate('player_lauch'),
							startPlay: true
						});
					}
					if (tvgDay > 0) {
						if (!!channel['epgId'] && !!EPG[channel['epgId']] && EPG[channel['epgId']][2].length) {
							menu.push({
								title: 'Смотреть сначала',
								restartProgram: true
							});
						}
						menu.push({
							заголовок: 'Исход',
							архив: true
						});
					}
					if (!!channel['epgId'] && !!EPG[channel['epgId']] && EPG[channel['epgId']][2].length) {
						menu.push({
							заголовок: Lampa.Lang.translate('search_start'),
							поиск: EPG[channel['epgId']][2][0][2]
						});
					}
					menu.push({
						заголовок: favI === -1 ? langGet('favorites_add'): langGet('favorites_del'),
						favToggle: true
					});
					if (isFavoriteGroup && favorite.length) {
						if (favI !== 0) {
							menu.push({
								title: langGet('favorites_move_top'),
								favMove: true,
								i: 0
							});
							menu.push({
								title: langGet('favorites_move_up'),
								favMove: true,
								i: favI - 1
							});
						}
						if ((favI + 1) !== favorite.length) {
							menu.push({
								title: langGet('favorites_move_down'),
								favMove: true,
								i: favI + 1
							});
							menu.push({
								title: langGet('favorites_move_end'),
								favMove: true,
								i: favorite.length - 1
							});
						}
						menu.push({
							title: langGet('favorites_clear'),
							favClear: true
						});
					}
					menu.push({
						заголовок: getStorage('epg', 'false') ? langGet('epg_off'): langGet('epg_on'),
						epgToggle: true
					});
					Lampa.Select.show({
						title: Lampa.Lang.translate('title_action'),
						элементы: меню,
						onSelect: function (sel) {
							if (!!sel.startPlay) {
								card.playThis();
							} else if (!!sel.archive) {
								var t = unixtime();
								var m = Math.floor(t/60);
								var d = Math.floor(t/86400);
								вар ди = (tvgDay + 1), нагрузка = ди;
								var ms = m - tvgDay * 1440;
								var tvgData = [];
								var playlist = [];
								var playlistMenu = [];
								var archiveMenu = [];
								var ps = 0;
								var prevDate = '';
								var d0 = toLocaleDateString(unixtime() * 1e3);
								var d1 = toLocaleDateString((unixtime() - 86400) * 1e3);
								var d2 = toLocaleDateString((unixtime() - 2 * 86400) * 1e3);
								var txtD = {};
								txtD[d0] = 'Сегодня -' + d0;
								txtD[d1] = 'Вчера -' + d1;
								txtD[d2] = 'Позавчера -' + d2;
								var onEpgLoad = function() {
									if (--load) return;
									for (var i=tvgData.length - 1; я >= 0; я--) {
										if (tvgData[i].length === 0) {
											var dt = (d - i) * 1440;
											для (var dm = 0; dm < 1440; dm+=30)
												tvgData[i].push([dt + dm, 30, toLocaleDateString((dt + dm) * 6e4), '']);
										}
										for (var j=0; j < tvgData[i].length; j++) {
											var epg = tvgData[i][j];
											если (epg[0] === ps || epg[0] > m || epg[0] + epg[1] < ms) продолжить;
											ps = epg[0];
											var url = catchupUrl(
												канал.URL,
												(channel['catchup'] || канал['catchup-type'] || listCfg['catchup'] || listCfg['catchup-type']),
												(channel['catchup-source'] || listCfg['catchup-source'])
											);
											var item = {
												title: toLocaleTimeString(epg[0] * 6e4) + ' - ' + epg[2],
												url: prepareUrl(url, epg),
												catchupUrl: url,
												плагин: plugin.component,
												epg: epg
											};
											вар newDate = toLocaleDateString(epg[0] * 6e4);
											newDate = txtD[newDate] || newDate;
											if (newDate !== prevDate) {
												if (prevDate) {
													archiveMenu.unshift({
														заголовок: предыдущая дата,
														разделитель: true
													});
												}
												playlistMenu.push({
													заголовок: новая дата,
													разделитель: true,
													плагин: plugin.component,
													URL: item.url
												});
												prevDate = newDate;
											}
											archiveMenu.unshift(item);
											playlistMenu.push(item);
											playlist.push(item);
										}
									}
									if (prevDate) {
										archiveMenu.unshift({
											заголовок: предыдущая дата,
											разделитель: true
										});
									}
									tvgData = [];
									Lampa.Select.show({
										заголовок: 'Исход',
										элементы: archiveMenu,
										onSelect: function (sel) {
											console.log(plugin.name, 'catchupUrl: ' + sel.catchupUrl, epg.slice(0,2));
											var video = {
												заголовок: sel.title,
												url: sel.url,
												iptv: true,
												плейлист: плейлист
											}
											Lampa.Controller.toggle('content');
											Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
											Lampa.Player.play(video);
											Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
											Lampa.Player.playlist(playlistMenu);
										},
										onBack: function () {
											Lampa.Controller.toggle('content');
										}
									})
								};
								пока (ди--) {
									tvgData[di] = [];
									(function() {
										var dd = di;
										networkSilentSessCache(Lampa.Utils.protocol() + 'epg.rootu.top/api' + epgPath + '/epg/' + channel['epgId'] + '/day/' + (d - dd) ,
											функция (данные) {
												tvgData[dd] = data;
												onEpgLoad()
											},
											onEpgLoad
										);
									})();
								}
							} else if (!!sel.search) {
								var search = sel.search
									.replace(/^«([^»]+)».*$/, '$1')
									.replace(/^"([^"]+)".*$/, '$1')
									.replace(/\s*\((19\d\d|20[01]\d|202[0-4])\)\s*(\*\s.+)?$/, '')
									.replace(/[.,]\s*(\d+(-й)?\s+(с-н|сезон)|(с-н|сезон)\s+\d+|[s][-.\s]*\d+(-й)?)?[-.,\s]*(\d+(-\d+| -я)?\s*(сери.|эпизоды?|episode|[cs]|ep?)\.?|(сери.|эпизоды?|episode|[cs]|ep?)[-.]?\s*\d+).*$/i,'')
									.replace(/\s*(\d+(-й)?\s+(с-н|сезон)|(с-н|сезон)\s+\d+|[s][-.\s]*\d+(-й)?)?[-.,\s]*(\d+(-\d+|-я )?\s*(сери.|эпизоды?|эпизод|[cс]|ep?)\.?|(сери.|эпизоды?|эпизод|[cs]|ep?)[-.]?\s*\d+)\.?/i,'')

									.replace(/\.\s+Дайджест\s*$/i, '')
									.replace(/\.?\s*\(([cCсСeE](ерия|pisode)?[-.]?\s*\d+|\d+(-[^)\s]+)?\s+[Сс]ерия)\)/,'')

									.replace(/\.[^.:]+:\s*[Чч](асть|\.)\s+\d+\S*$/,'')
									.replace(/\.\s*Сборник\s+\d+\S*\s*$/i,'')
									.replace(/\s*[\[(]?(\d|1\d|2[0-5])\+[\])]?[.\s]*$/, '')
									.replace(/\s*(\(\)|\[])/, '')
								;
								// Lampa.Controller.toContent();
								Lampa.Search.open({input: search});
							} else if (!!sel.restartProgram) {
								var epg = EPG[channel['epgId']][2][0];
								var type = (channel['catchup'] || канал['catchup-type'] || listCfg['catchup'] || listCfg['catchup-type'] || '');
								var url = catchupUrl(
									канал.URL,
									тип,
									(channel['catchup-source'] || listCfg['catchup-source'])
								);
								var flussonic = type.search(/^flussonic/i) === 0;
								if (flussonic) {
									url = url.replace('${(d)S}', 'now');
								}
								console.log(plugin.name, 'catchupUrl: ' + url, epg.slice(0,2));
								var video = {
									заголовок: channel.Title,
									url: prepareUrl(url, epg),
									плагин: plugin.component,
									catchupUrl: url,
									iptv: true,
									epg: epg
								}
								if (flussonic) video['timeline'] = {
									время: 11,
									процент: 0,
									обработчик: функция(){},
									//хеш: '',
									длительность: (epg[1] * 60)
								};
								Lampa.Controller.toggle('content');
								Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
								Lampa.Player.play(video);//Lampa.PlayerVideo.to(0)
								Lampa.Player.runas && Lampa.Player.runas(Lampa.Storage.field('PlayerIPTV'));
							} else if (!!sel.epgToggle) {
								вар isView = !getStorage('epg', false);
								setStorage('epg', isView);
								epgListView(isView);
								Lampa.Controller.toggle('content');
							} еще {
								var favGroup = lists[object.id].groups[0];
								if (!!sel.favToggle) {
									if (favI === -1) {
										favI = favorite.length
										favorite[favI] = favID(channel.Title);
										catalog[favGroup.key].channels[favI] = channel;
									} еще {
										favorite.splice(favI, 1);
										catalog[favGroup.key].channels.splice(favI, 1);
									}
								} else if (!!sel.favClear) {
									любимый = [];
									catalog[favGroup.key].channels = [];
								} else if (!!sel.favMove) {
									favorite.splice(favI, 1);
									favorite.splice(sel.i, 0, favID(channel.Title));
									catalog[favGroup.key].channels.splice(favI, 1);
									catalog[favGroup.key].channels.splice(sel.i, 0, channel);
								}
								setStorage('favorite' + object.id, favorite);
								favGroup.title = catalog[favGroup.key].title
									+ ' [' + catalog[favGroup.key].channels.length + ']';
								if (isFavoriteGroup) {
									Lampa.Activity.replace(Lampa.Arrays.clone(lists[object.id].activity));
								} еще {
									favIcon.toggleClass('hide', favorite.indexOf(favID(channel.Title)) === -1);
									Lampa.Controller.toggle('content');
								}
							}
						},
						onBack: function () {
							Lampa.Controller.toggle('content');
						}
					});
				});
				body.append(card);
				if (!!channel['epgId']) {
					card.attr('data-epg-id', channel['epgId']).addClass('js-epgNoRender');
					epgRender(channel['epgId']);
				}
			},
			{
				объем: 18,
				onEnd: function (last, total, left) {
					// body.find('.layer--render').removeClass('layer--render');
					_this2.activity.loader(false);
					_this2.activity.toggle();
					if (chIndex > layerCnt) {
						layerFocusI = 0;
						layerCards = body.find('.js-layer--hidden');
					}
					// Lampa.Layer.visible(scroll.render(true));
				}
			});
		data.forEach(function (channel) {
			bulkFn(channel);
			if (!!channel['epgId'] && catEpg.indexOf(channel['epgId']) === -1) catEpg.push(channel['epgId']);
		});
		// var catEpgString = catEpg.sort(function(a,b){return ab}).join('-');
		// var catEpgHash = utils.hash36(catEpgString);
		// console.log('Epg', catEpgHash, catEpgString, data);
	};
	function setEpgId(channelGroup) {
		if (channelGroup.setEpgId || !channelGroup.channels || !listCfg['epgApiChUrl']) return;
		var chIDs = {id2epg: {}, piconUrl: '', id2picon: []}, i=0, channel;
		networkSilentSessCache(listCfg['epgApiChUrl'], function(d){
			chIDs = d;
			if (!chIDs['id2epg']) chIDs['id2epg'] = {};
			epgPath = !chIDs['epgPath'] ? '' : ('/' + chIDs['epgPath']);
		});
		var chShortName = function(chName){
			return chName
				.toLowerCase()
				.replace(/\s+\(архив\)$/, '')
				.replace(/\s+\((\+\d+)\)/g, ' $1')
				.replace(/^телеканал\s+/, '')
				.replace(/([!\s.,()–-]+|ⓢ|ⓖ|ⓥ|ⓞ|Ⓢ|Ⓖ|Ⓥ|Ⓞ)/g, ' ').trim()
				.replace(/\s(канал|тв)(\s.+|\s*)$/, '$2')
				.replace(/\s(50|orig|original)$/, '')
				.replace(/\s(\d+)/g, '$1')
				;
		};
		вар trW = {"ё":"e","у":"y","к":"k","е":"e","н":"h","ш":"w","з":"3","х":"x","ы":"bl","в" :"b","а":"a","р":"p","о":"o","ч":"4","с":"c","м":"m","т":"t","ь":"b","б":"6"};
		var trName = function(word) {
			return word.split('').map(function (char) {
				return trW[char] || char;
			}).присоединиться("");
		};
		var epgIdByName = function(v, find, epgId) {
			вар n = chShortName (v), fw, ключ;
			if (n === '' || (!chIDs[n[0]] && !find)) return 0;
			fw = n[0];
			if (!!chIDs[fw]) {
				if (!!chIDs[fw][n]) return chIDs[fw][n];
				n = trName(n);
				if (!!chIDs[fw][n]) return chIDs[fw][n];
				если (найти) {
					for (key in chIDs[fw]) {
						if (chIDs[fw][key] == epgId) {
							return epgId;
						} else if (n === trName(key)) {
							return chIDs[fw][key];
						}
					}
				}
			}
			if (n[0] !== fw && !!chIDs[n[0]]) {
				fw = n[0];
				if (!!chIDs[fw][n]) return chIDs[fw][n];
				если (найти) {
					for (key in chIDs[fw]) {
						if (chIDs[fw][key] == epgId) {
							return epgId;
						} else if (n === trName(key)) {
							return chIDs[fw][key];
						}
					}
				}
			} else if (find) {
				for(var keyW in trW) {
					if (trW[keyW] === fw && !!chIDs[keyW]) {
						for (key in chIDs[keyW]) {
							if (chIDs[keyW][key] == epgId) {
								return epgId;
							} else if (n === trName(key)){
								return chIDs[keyW][key];
							}
						}
					}
				}
			}
			вернуть 0;
		};
		for (;i < channelGroup.channels.length;i++) {
			канал = channelGroup.channels[i];
			channel['epgId'] = (listCfg['isEpgIt999'] || listCfg['isYosso'])
				? (channel['tvg-id'] && /^\d{1,4}$/.test(channel['tvg-id']) ? channel['tvg-id'] : epgIdByName(channel['Title'], true, channel['tvg-id']))
				: (chIDs.id2epg[channel['tvg-id'] || ''] || epgIdByName(channel['Title'], isSNG, channel['tvg-id']) || channel['tvg-id']);
			/*if (isSNG && !/^\d+$/.test(channel['epgId'])) {
				channel['epgId'] = epgIdByName(channel['Title'], isSNG) || channel['epgId'];
			}*/
			if (!channel['tvg-logo'] && channel['epgId'] && !!chIDs.piconUrl) {
				channel['tvg-logo'] = Lampa.Utils.protocol() + chIDs.piconUrl.replace('{picon}', (chIDs.id2picon && chIDs.id2picon[channel['epgId']]) ? chIDs.id2picon[channel['epgId']] : channel['epgId']);
			}
			if (!channel['tvg-logo']) {
				if (channel['epgId'] && (listCfg['isEpgIt999'] || isSNG) && /^\d{1,4}$/.test(channel['epgId'])) {
					channel['tvg-logo'] = Lampa.Utils.protocol() + 'epg.one/img2/' + channel['epgId'] + '.png'
				} else if (isSNG && !/^Ch \d+$/.test(channel['Title'])) {
					канал['tvg-logo'] = Lampa.Utils.protocol() + 'epg.rootu.top/picon/'
						+ encodeURIComponent(channel['Title']) + '.png';
				}
			}
		}
	}
	this.build = function (catalog) {
		var channelGroup = !catalog[object.currentGroup]
				? (lists[object.id].groups.length > 1 && !!catalog[lists[object.id].groups[1].key]
						? catalog[lists[object.id].groups[1].key]
						: {'channels': []}
				)
				: catalog[object.currentGroup];
		var _this2 = this;
		Lampa.Background.change();
		Lampa.Template.add(plugin.component + '_button_category', "<style>@media screen and (max-width: 2560px) {." + plugin.component + " .card--collection {width: 16.6%!important;}}@media screen and (max-width: 800px) {." + plugin.component + " .card--collection {width: 24.6%!important;}}@media screen and (max-width: 500px) {." + plugin.component + " .card--collection {width: 33.3%!important;}}</style><div class=\"full-start__button selector view--category\"><svg style=\"enable-background:new 0 0 512 512;\" version=\"1.1\" viewBox=\"0 0 24 24\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><g id=\"info\"/><g id=\"icons\"><g id=\"menu\"><path d=\"M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z\" fill=\"currentColor\"/><path d=\"M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z\" fill=\"currentColor\"/><path d=\"M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z\" fill=\"currentColor\"/></g></g></svg><span>" + langGet('categories') + "</span>\n </div>");
		Lampa.Template.add(plugin.component + '_info_radio', '<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right" style="display: flex !important;"> <div id="stantion_filtr"></div></div></div>');
		var btn = Lampa.Template.get(plugin.component + '_button_category');
		info = Lampa.Template.get(plugin.component + '_info_radio');
		info.find('#stantion_filtr').append(btn);
		info.find('.view--category').on('hover:enter hover:click', function () {
			_this2.selectGroup();
		});
		info.find('.info__title-original').text(!catalog[object.currentGroup] ? '' : catalog[object.currentGroup].title);
		info.find('.info__title').text('');
		html.append(info.append());
		if (channelGroup.channels.length) {
			setEpgId(channelGroup);
			scroll.render().addClass('layer--wheight').data('mheight', info);
			html.append(scroll.render());
			this.append(channelGroup.channels);
			if (getStorage('epg', false)) {
				scroll.render().css({float: "left", width: '70%'});
				scroll.render().parent().append(epgTemplate);
			}
			scroll.append(body);
			setStorage('last_catalog' + object.id, object.currentGroup ? object.currentGroup : '!!');
			lists[object.id].activity.currentGroup = object.currentGroup;
		} еще {
			var empty = new Lampa.Empty();
			html.append(empty.render());
			this.activity.loader(false);
			Lampa.Controller.collectionSet(info);
			Navigator.move('right');
		}
	};
	this.selectGroup = function () {
		var activity = Lampa.Arrays.clone(lists[object.id].activity);
		var groups = Lampa.Arrays.clone(lists[object.id].groups).map(function(group){
			group.selected = object.currentGroup === group.key;
			возврат группы;
		});
		Lampa.Select.show({
			title: langGet('categories'),
			элементы: группы,
			onSelect: function(group) {
				if (object.currentGroup !== group.key) {
					activity.currentGroup = group.key;
					Lampa.Activity.replace(activity);
				} еще {
					Lampa.Player.opened() || Lampa.Controller.toggle('content');
				}
			},
			onBack: function() {
				Lampa.Player.opened() || Lampa.Controller.toggle('content');
			}
		});
	};
	this.start = function () {
		if (Lampa.Activity.active().activity !== this.activity) return; //обязательно, иначе наблюдается баг, активность возникает, но не запускается, в то время как компонент загружается и запускается сам.
		var _this = this;
		Lampa.Controller.add('content', {
			toggle: function toggle() {
				Lampa.Controller.collectionSet(scroll.render());
				Lampa.Controller.collectionFocus(last || false, scroll.render());
			},
			слева: функция left() {
				if (Navigator.canmove('left')) Navigator.move('left');
				else Lampa.Controller.toggle('menu');
			},
			справа: функция right() {
				if (Navigator.canmove('right')) Navigator.move('right');
				иначе _this.selectGroup();
			},
			up: function up() {
				if (Navigator.canmove('up')) {
					Navigator.move('up');
				} еще {
					if (!info.find('.view--category').hasClass('focus')) {
						Lampa.Controller.collectionSet(info);
						Navigator.move('right')
					} else Lampa.Controller.toggle('head');
				}
			},
			вниз: функция down() {
				if (Navigator.canmove('down')) Navigator.move('down');
				else if (info.find('.view--category').hasClass('focus')) {
					Lampa.Controller.toggle('content');
				}
			},
			назад: функция back() {
				Lampa.Activity.backward();
			}
		});
		Lampa.Controller.toggle('content');
	};
	this.pause = function () {
		Lampa.Player.runas && Lampa.Player.runas('');
	};
	this.stop = function () {
		Lampa.Player.runas && Lampa.Player.runas('');
	};
	this.render = function () {
		return html;
	};
	this.destroy = function () {
		Lampa.Player.runas && Lampa.Player.runas('');
		network.clear();
		scroll.destroy();
		if (info) info.remove();
		layerCards = null;
		if (layerInterval) clearInterval(layerInterval);
		if (epgInterval) clearInterval(epgInterval);
		html.remove();
		body.remove();
		favorite = null;
		сеть = null;
		html = null;
		тело = null;
		info = null;
	};
}

if (!Lampa.Lang) {
	var lang_data = {};
	Lampa.Lang = {
		добавить: функция add(data) {
			lang_data = data;
		},
		функция translate(key) {
			return lang_data[key] ? lang_data[key].ru : key;
		}
	};
}
var langData = {};
function langAdd(name, values) {
	langData[plugin.component + '_' + name] = values;
}
function langGet(name) {
	return Lampa.Lang.translate(plugin.comComponent + '_' + name);
}

langAdd('max_ch_in_group',
	{
		ru: 'Количество каналов в категории',
		Великобритания: «Количество каналов в категориях»,
		быть: 'Колкасць каналў по категориям',
		en: 'Количество каналов в категории',
		zh: '分类中的频道数量'
	}
);
langAdd('max_ch_in_group_desc',
	{
		ru: «Если количество превышено, категория разбивается на несколько. Уменьшите количество на слабых устройствах,
		Великобритания: «Какое количество повышено, категории варьируются на количество. Уменьшить количество на слабых пристройках,
		быть: 'Калифорнийское число превышено, категория разбивается на несколько. Паменьшице колькасць на слабых предприятиях,
		Если количество превышено, категория разделяется на несколько частей. Уменьшите количество устройств со слабыми характеристиками.
		zh: '如果超出数量，则将分类拆分为多个。在弱设备上减少数量。'
	}
);
langAdd('default_playlist',
	{
		ru: 'https://tsynik.github.io/tv.m3u',
		Великобритания: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
		be: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
		ru: «https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8»,
		ж: 'https://raw.iqiq.io/Free-TV/IPTV/master/playlist.m3u8'
	}
);
langAdd('default_playlist_cat',
	{
		ru: 'Россия',
		Великобритания: «Украина»,
		be: 'Беларусь',
		en: 'VOD Movies (EN)',
		zh: 'Китай'
	}
);
langAdd('settings_playlist_num_group',
	{
		ru: 'Плейлист ',
		uk: 'Плейлист',
		be: 'Плэйліст ',
		en: 'Плейлист',
		ж: '播放列表'
	}
);
langAdd('settings_list_name',
	{
		ru: 'Название',
		uk: 'Назва',
		be: 'Назва',
		en: 'Имя',
		ж: '名称'
	}
);
langAdd('settings_list_name_desc',
	{
		ru: 'Название плейлиста в левом меню',
		uk: 'Название плейлиста в левом меню',
		быть: 'Название плэйлиста ў левого меню',
		en: 'Название плейлиста в левом меню',
		zh: '左侧菜单中的播放列表名称'
	}
);
langAdd('settings_list_url',
	{
		ru: 'URL- мыш',
		uk: 'URL-адрес',
		be: 'URL-адрас',
		en: 'URL',
		ж: '网址'
	}
);
langAdd('settings_list_url_desc0',
	{
		ru: 'По умолчанию используется плейлист из проекта <i>https://github.com/Free-TV/IPTV</i><br>Вы можете заменить его на свой.',
		Великобритания: 'Для создания плейлиста из проекта <i>https://github.com/Free-TV/IPTV</i><br>Вы можете узнать его на свій.',
		be: 'Па смаўчанні выкарыстоўваецца плейлист с проектом <i>https://github.com/Free-TV/IPTV</i><br> Вы можете забыть его на свой.',
		en: 'Плейлист по умолчанию взят из проекта <i>https://github.com/Free-TV/IPTV</i><br>Вы можете заменить его своим собственным.',
		zh: '默认播放列表来自项目 <i>https://github.com/Free-TV/IPTV</i><br>您可以将其替换为您自己的。'
	}
);
langAdd('settings_list_url_desc1',
	{
		ru: 'Вы можете добавить сюда еще один плейлист. Ссылки в плейлистах обычно заканчиваются на <i>.m3u</i> или <i>.m3u8</i>',
		Великобритания: «Вы можете добавить один плейлист в суд. При воспроизведении плейлистов защелкивайтесь на <i>.m3u</i> или <i>.m3u8</i>',
		быть: «Вы можете дать мне возможность сыграть в суде». Спасения на плейлистах обычно загружаются на <i>.m3u</i> или <i>.m3u8</i>',
		en: 'Вы можете добавить еще один пробный плейлист. Ссылки на плейлисты обычно заканчиваются на <i>.m3u</i> или <i>.m3u8</i>',
		zh: '您可以添加另一个播放列表。 播放列表链接通常以 <i>.m3u</i> 或 <i>.m3u8</i> 结尾'
	}
);
langAdd('categories',
	{
		ru: 'Категории',
		uk: 'Категорія',
		be: 'Категорыя',
		en: 'Категории',
		ж: '分类'
	}
);
langAdd('uid',
	{
		ru: 'UID',
		Великобритания: 'UID',
		be: 'UID',
		en: 'UID',
		zh: 'UID'
	}
);
langAdd('unique_id',
	{
		ru: 'уникальный идентификатор (нужен для некоторых ссылок на плейлисты)',
		Великобритания: 'уникальный идентификатор (необходим для деятельных проверок на регулярном открытии)',
		быть: 'уникальные удостоверения (необходимы для некаторых спайлок на спіс прайгравання)',
		en: 'уникальный идентификатор (необходим для некоторых ссылок на плейлисты)',
		zh: 'ID ID（某些播放列表链接需要）'
	}
);
langAdd('launch_menu',
	{
		ru: 'Запуск через меню',
		uk: 'Запуск через меню',
		быть: 'Запуск праз меню',
		en: 'Запустить через меню',
		ж: '通过菜单启动'
	}
);
langAdd('favorites',
	{
		ru: 'Избранное',
		uk: 'Вибране',
		be: 'Выбранае',
		en: 'Избранное',
		ж: '收藏夹'
	}
);
langAdd('favorites_add',
	{
		ru: 'Добавить в избранное',
		Великобритания: «Додать в бране»,
		быть: 'Дадаць у абранае',
		en: 'Добавить в избранное',
		zh: '添加到收藏夹'
	}
);
langAdd('favorites_del',
	{
		ru: 'Удалить из избранного',
		Великобритания: 'Видалити с выбором',
		быть: 'Выдалиць из абранага',
		en: 'Удалить из избранного',
		zh: '从收藏夹中删除'
	}
);
langAdd('favorites_clear',
	{
		ru: 'Очистить избранное',
		Великобритания: «Очистить выбор»,
		быть: 'Актуализация выбрана',
		en: 'Явные фавориты',
		ж: '清除收藏夹'
	}
);
langAdd('favorites_move_top',
	{
		ru: 'В начало списка',
		Великобритания: «На початок списку»,
		быть: 'Да пачатку спису',
		en: 'В начало списка',
		ж: '到列表顶部'
	}
);
langAdd('favorites_move_up',
	{
		ru: 'Сдвинуть вверх',
		Великобритания: «Зрушити вгору»,
		быть: 'Ссунуць уверх',
		en: 'Move up',
		ж: '上移'
	}
);
langAdd('favorites_move_down',
	{
		ru: 'Сдвинуть вниз',
		Великобритания: «Зрушити вниз»,
		быть: 'Ссунуть уніз',
		en: 'Move down',
		ж: '下移'
	}
);
langAdd('favorites_move_end',
	{
		ru: 'В конце списка',
		Великобритания: 'В кінець списку',
		быть: 'У канец спису',
		en: 'До конца списка',
		ж: '到列表末尾'
	}
);
langAdd('epg_on',
	{
		ru: «Включить телепрограмму»,
		Великобритания: «Увімкнути телепрограму»,
		быть: 'Уключить тэлепраграму',
		en: 'TV Guide: On',
		ж: '電視指南:開'
	}
);
langAdd('epg_off',
	{
		ru: «Отключить телепрограмму»,
		Великобритания: «Вимкнути телепрограму»,
		быть: «Адключыць элепраграму»,
		en: 'TV Guide: Off',
		ж: '電視指南:關閉'
	}
);
langAdd('epg_title',
	{
		ru: 'Телепрограмма',
		Великобритания: «Телепрограма»,
		быть: «Тэлепраграма»,
		en: 'TV Guide',
		ж: '電視指南'
	}
);
langAdd('square_icons', {
	ru: 'Квадратные логоканалы',
	Великобритания: «Квадратный логотип каналов»,
	быть: 'Квадратный логаў канал',
	en: 'Square channel logos',
	ж: '方形通道標誌'
});
langAdd('contain_icons', {
	ru: «Коррекция размера логотипа телеканала»,
	Великобритания: «Управление разоблачением логотипа телеканалу»,
	быть: «Карэкцыя памеру лагатыпа тэлеканала»,
	en: 'Коррекция размера логотипа телеканала',
	zh: '電視頻道標誌尺寸校正'
});
langAdd('contain_icons_desc', {
	ru: «Может некорректно работать на старых устройствах»,
	Великобритания: «Можно некорректно работать на старых пристроях»,
	быть: «Можа некарэктна працаваць на старых предприятиях»,
	Возможно, не будет корректно работать на старых устройствах.
	zh: '可能无法在较旧的设备上正常工作。'
});

Lampa.Lang.add(langData);

function favID(title) {
	return title.toLowerCase().replace(/[\s!-\/:-@\[-`{-~]+/g, '')
}
function getStorage(name, defaultValue) {
	return Lampa.Storage.get(plugin.component + '_' + name, defaultValue);
}
function setStorage(name, val, noListen) {
	return Lampa.Storage.set(plugin.component + '_' + name, val, noListen);
}
функция getSettings(name) {
	return Lampa.Storage.field(plugin.component + '_' + name);
}
function addSettings(type, param) {
	var data = {
		компонент: plugin.component,
		параметр: {
			имя: plugin.component + '_' + param.name,
			тип: тип, // выбрать|триггер|ввод|заголовок|статический
			значения: !param.values ​​? '' : param.values,
			placeholder: !param.placeholder ? '' : param.placeholder,
			по умолчанию: (typeof param.default === 'undefined') ? '' : param.default
		},
		поле: {
			имя: !param.title ? (!param.name ? '' : param.name) : param.title
		}
	}
	if (!!param.name) data.param.name = plugin.component + '_' + param.name;
	if (!!param.description) data.field.description = param.description;
	if (!!param.onChange) data.onChange = param.onChange;
	если (!!param.onRender) data.onRender = param.onRender;
	Lampa.SettingsApi.addParam(данные);
}

function configurePlaylist(i) {
	addSettings('title', {title: langGet('settings_playlist_num_group') + (i+1)});
	вар defName = 'список' + (я+1);
	var activity = {
		id: i,
		url: '',
		заголовок: plugin.name,
		группы: [],
		currentGroup: getStorage('last_catalog' + i, langGet('default_playlist_cat')),
		компонент: plugin.component,
		страница: 1
	};
	if (activity.currentGroup === '!!') activity.currentGroup = '';
	addSettings('input', {
		title: langGet('settings_list_name'),
		имя: 'list_name_' + i,
		по умолчанию: i ? '' : plugin.name,
		placeholder: i ? defName : '',
		описание: langGet('settings_list_name_desc'),
		onChange: function (newVal) {
			var title = !newVal ? (i ? defName : plugin.name) : newVal;
			$('.js-' + plugin.component + '-menu' + ​​i + '-title').text(title);
			activity.title = title + (title === plugin.name ? '' : ' - ' + plugin.name);
		}
	});
	addSettings('input', {
		title: langGet('settings_list_url'),
		имя: 'list_url_' + i,
		по умолчанию: i ? '' : langGet('default_playlist'),
		placeholder: i ? 'http://example.com/list.m3u8' : '',
		описание: i
			? (!getStorage('list_url_' + i) ? langGet('settings_list_url_desc1') : '')
			: langGet('settings_list_url_desc0'),
		onChange: function (url) {
			if (url === activity.url) return;
			if (activity.id === curListId) {
				каталог = {};
				curListId = -1;
			}
			if (/^https?:\/\/./i.test(url)) {
				activity.url = url;
				$('.js-' + plugin.component + '-menu' + ​​i).show();
			} еще {
				activity.url = '';
				$('.js-' + plugin.component + '-menu' + ​​i).hide();
			}
		}
	});

	var name = getSettings('list_name_' + i);
	вар URL = getSettings('list_url_' + я);
	var title = (name || defName);
	activity.title = title + (title === plugin.name ? '' : ' - ' + plugin.name);
	var menuEl = $('<li class="menu__item selector js-' + plugin.component + '-menu' + ​​i + '">'
		+ '<div class="menu__ico">' + plugin.icon + '</div>'
		+ '<div class="menu__text js-' + plugin.component + '-menu' + ​​i + '-title">'
		+ encoder.text(title).html()
		+ '</div>'
		+ '</li>')
		.скрывать()
		.on('hover:enter', function(){
			if (Lampa.Activity.active().component === plugin.component) {
				Lampa.Activity.replace(Lampa.Arrays.clone(activity));
			} еще {
				Lampa.Activity.push(Lampa.Arrays.clone(activity));
			}
		});
	if (/^https?:\/\/./i.test(url)) {
		activity.url = url;
		menuEl.show();
	}
	lists.push({activity: activity, menuEl: menuEl, groups: []});
	return !activity.url ? i + 1 : i;
}

Lampa.Component.add(plugin.component, pluginPage);
// Готовим настройки
Lampa.SettingsApi.addComponent(plugin);
addSettings(
	'курок',
	{
		title: langGet('square_icons'),
		имя: 'square_icons',
		по умолчанию: false,
		onChange: function(v){
			$('.' + plugin.component + '.category-full').toggleClass('square_icons', v === 'true');
		}
	}
);
addSettings(
	'курок',
	{
		title: langGet('contain_icons'),
		описание: langGet('contain_icons_desc'),
		имя: 'contain_icons',
		по умолчанию: true,
		onChange: function(v){
			$('.' + plugin.component + '.category-full').toggleClass('contain_icons', v === 'true');
		}
	}
);
addSettings(
	'курок',
	{
		title: langGet('epg_on'),
		имя: 'epg',
		по умолчанию: false,
		onChange: function(v){
			epgListView(v === 'true');
		}
	}
);
addSettings(
	'курок',
	{
		заголовок: langGet('launch_menu'),
		имя: 'launch_menu',
		по умолчанию: false
	}
);
addSettings(
	'выбирать',
	{
		title: langGet('max_ch_in_group'),
		описание: langGet('max_ch_in_group_desc'),
		имя: 'max_ch_in_group',
		ценности: {
			0: '#{settings_param_card_view_all}',
			60: '60',
			120: '120',
			180: '180',
			240: '240',
			300: '300'
		},
		по умолчанию: 300
	}
);
for (var i=0; i <= lists.length; i++) i = configurePlaylist(i);
UID = getStorage('uid', '');
если (!UID) {
	UID = Lampa.Utils.uid(10).toUpperCase().replace(/(.{4})/g, '$1-');
	setStorage('uid', UID);
} else if (UID.length > 12) {
	UID = UID.substring(0, 12);
	setStorage('uid', UID);
}
addSettings('title', {title: langGet('uid')});
addSettings('static', {title: UID, description: langGet('unique_id')});
//~ Готовим настройки

function pluginStart() {
	if (!!window['plugin_' + plugin.component + '_ready']) {
		console.log(plugin.name, 'плагин уже запущен');
		возвращаться;
	}
	window['plugin_' + plugin.component + '_ready'] = true;
	вар меню = $('.menu .menu__list').eq(0);
	for (var i=0; i < lists.length; i++) menu.append(lists[i].menuEl);
	isSNG = ['uk', 'ru', 'be'].indexOf(Lampa.Storage.field('language')) >= 0;
	console.log(plugin.name, 'plugin start', menu.length, lists.length, isSNG);
}

console.log(plugin.name, 'plugin ready start', !!window.appready ? 'now' : 'waiting event ready');
if (!!window.appready) pluginStart();
else Lampa.Listener.follow('app', function(e){if (e.type === 'ready') pluginStart()});
})();