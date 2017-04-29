/*global bp, DocumentTouch*/

$(function () {
    'use strict';

    var $body = $('body');
    var $document = $(document);
    var $window = $(window);
    var bootstrapBreakpoint = bp.getBreakpointSize();
    var oldBootstrapBreakpoint = bootstrapBreakpoint;

    // prevent default action for disabled buttons
    $document.on('click', '.btn', function (e) {
        if ($(this).hasClass('disabled')) {
            e.preventDefault();
            e.stopImmediatePropagation();

            return false;
        }
    });

    // Initialize ajax-form
    $('[data-role=ajax-form]').ajaxForm();

    // Initialize tooltips for non touch devices
    if (!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch)) {
        $.fn.tooltip.Constructor.DEFAULTS.trigger = 'hover';
        $.fn.tooltip.Constructor.DEFAULTS.placement = 'auto top';
        $.fn.tooltip.Constructor.DEFAULTS.container = 'body';
        $body.tooltip({selector: '.has-tooltip, [data-toggle=tooltip]'});
    }

    // Initialize confirmation2
    $.fn.confirmation2.Constructor.DEFAULTS.container = 'body';
    $.fn.confirmation2.Constructor.DEFAULTS.placement = 'auto top';
    $.fn.confirmation2.Constructor.DEFAULTS.content = $('.confirmation2-template').html();
    $('[data-toggle=confirmation2]').confirmation2();

    // Close confirmation2 on escape
    $document.keyup(function (e) {
        if (27 === e.keyCode) {
            $('[aria-describedby^=confirmation2]').confirmation2('hide');
        }
    });

    // Select first input on confirmation2 shown
    $body.on('shown.bs.confirmation2', '[data-toggle=confirmation2]', function () {
        var $tip = $('#' + $(this).attr('aria-describedby'));
        $('input:first', $tip).focus();
    });

    // Form submit trigger
    $('.trigger-submit').on('change', function () {
        return $(this).parents('form').submit();
    });

    // Disable form buttons while a form is submitting
    $body.on('ajaxComplete, ajaxSend, submit', 'form', function (e) {
        $('[type=submit]', this).prop('disabled', e.type === 'ajaxSend' || e.type === 'submit');
    });

    $('.remove-row').on('ajaxSuccess', function () {
        $(this).tooltip('destroy').closest('li').fadeOut();
    });

    $('.js-remove-tr')
        .on('ajaxSend', function () {
            return $(this).hide();
        })
        .on('ajaxSuccess', function () {
            return $(this).closest('tr').fadeOut();
        });

    $document.off('breakpoint:change').on('breakpoint:change', function (e, breakpoint) {
        if (breakpoint === 'sm' || breakpoint === 'xs') {
            return $('.sidebar-expanded .toggle-nav-collapse').trigger('click');
        }
        if (oldBootstrapBreakpoint > bootstrapBreakpoint) {
            return $('.sidebar-collapsed .side-nav-toggle').trigger('click');
        }
    });

    // Trigger breakpoint:change while resizing
    $window.off('resize.app').on('resize.app', function () {
        oldBootstrapBreakpoint = bootstrapBreakpoint;
        bootstrapBreakpoint = bp.getBreakpointSize();

        if (bootstrapBreakpoint !== oldBootstrapBreakpoint) {
            return $document.trigger('breakpoint:change', [bootstrapBreakpoint]);
        }
    });

    // Initialize remote clock
    $('.server-time-clock').remoteClock({
        url: '/time',
        syncInterval: 30000,
        template: '<i class="fa fa-clock-o" aria-hidden="true"></i> <span class="time">88:88:88</span>',
        parser: function (data) {
            return Date.parse(data.time);
        }
    });
});
