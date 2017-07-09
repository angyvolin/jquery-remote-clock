/*!
 * jQuery Remote Clock 1.0.0
 *
 * Author: Andrii Volin <angy.volin@gmail.com>
 * Released under the MIT license
 * https://github.com/angyvolin/jquery-remote-clock/blob/master/LICENSE
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var old;

    var RemoteClock = function (element, options) {
        this.type = null;
        this.options = null;
        this.tickTimeout = null;
        this.syncTimeout = null;
        this.diff = 0;
        this.$element = null;
        this.$clock = null;
        this.parser = null;

        this.init('remoteClock', element, options);
    };

    RemoteClock.VERSION = '1.0.0';

    RemoteClock.TICK_INTERVAL = 1000;

    RemoteClock.DEFAULTS = {
        url: '/time',
        syncInterval: 10000,
        template: '<span class="time">88:88:88</span>',
        selector: '.time',
        parser: Date.parse
    };

    RemoteClock.prototype.init = function (type, element, options) {
        this.type = type;
        this.options = $.extend({}, RemoteClock.DEFAULTS, options || {});
        this.$element = $(element).append(this.options.template);
        this.$clock = this.$element.find(this.options.selector);
        this.setParser(this.options.parser);
        this.sync();
    };

    RemoteClock.prototype.setParser = function (parser) {
        if ('object' === typeof parser) {
            this.parser = parser.parse;
        } else if ('function' === typeof parser) {
            this.parser = parser;
        } else {
            throw Error('The "parser" option is expected to be of type function or object with ::parse() method.');
        }
    };

    RemoteClock.prototype.sync = function () {
        var self = this;

        clearTimeout(this.syncTimeout);

        $.ajax({
            url: this.options.url,
            suppressErrors: true
        }).done(function (serverTime) {
            self.diff = self.parser(serverTime) - Date.now();
            self.tick.apply(self);
            self.syncTimeout = setTimeout($.proxy(self.sync, self), self.options.syncInterval);
        });
    };

    RemoteClock.prototype.tick = function () {
        clearTimeout(this.tickTimeout);

        this.$clock.text(
            new Date(Date.now() + this.diff).toTimeString().split(' ')[0]
        );

        this.tickTimeout = setTimeout($.proxy(this.tick, this), RemoteClock.TICK_INTERVAL);
    };

    RemoteClock.prototype.destroy = function () {
        clearInterval(this.tickTimeout);
        clearInterval(this.syncTimeout);
        this.$element.off('click').removeData(this.type);
        if (null !== this.$clock) {
            this.$clock.detach();
            this.$clock = null;
        }
        this.$element.empty();
        this.$element = null;
    };

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('remoteClock');
            var options = 'object' === typeof option && option;

            if (!data && 'destroy' === option) {
                return;
            }

            if (!data) {
                data = new RemoteClock(this, options);
                $this.data('remoteClock', data);
            }

            if ('string' === typeof option) {
                data[option]();
            }
        });
    }

    old = $.fn.remoteClock;

    $.fn.remoteClock = Plugin;
    $.fn.remoteClock.Constructor = RemoteClock;

    $.fn.remoteClock.noConflict = function () {
        $.fn.remoteClock = old;

        return this;
    };
}));
