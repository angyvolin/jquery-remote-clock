+function ($) {
    'use strict';

    var old;

    var RemoteClock = function (element, options) {
        this.type = null;
        this.options = null;
        this.paused = false;
        this.tickTimeout = null;
        this.syncTimeout = null;
        this.diff = 0;
        this.$element = null;
        this.$clock = null;
        this.parser = null;

        this.init('remoteClock', element, options);

        this.$element.on('click', $.proxy(this.toggle, this));
    };

    RemoteClock.VERSION = '1.0.0';

    RemoteClock.TICK_INTERVAL = 1000;

    RemoteClock.DEFAULTS = {
        url: '/time',
        syncInterval: 10000,
        template: '<span class="time">88:88:88</span>',
        selector: '.time',
        parser: Date
    };

    RemoteClock.prototype.init = function (type, element, options) {
        this.type = type;
        this.options = $.extend({}, RemoteClock.DEFAULTS, options || {});
        this.$element = $(element).append(this.options.template);
        this.$clock = this.$element.find(this.options.selector);
        this.paused = 'true' === localStorage.getItem(this.type + '.paused');
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

    RemoteClock.prototype.toggle = function () {
        this.paused = !this.paused;
        localStorage.setItem(this.type + '.paused', this.paused);

        if (this.paused) {
            clearTimeout(this.tickTimeout);
            clearTimeout(this.syncTimeout);
        } else {
            this.sync();
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

            if (!this.paused) {
                self.syncTimeout = setTimeout($.proxy(self.sync, self), self.options.syncInterval);
            }
        });
    };

    RemoteClock.prototype.tick = function () {
        clearTimeout(this.tickTimeout);

        this.$clock.text(
            new Date(Date.now() + this.diff).toTimeString().split(' ')[0]
        );

        if (!this.paused) {
            this.tickTimeout = setTimeout($.proxy(this.tick, this), RemoteClock.TICK_INTERVAL);
        }
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
}(jQuery);
