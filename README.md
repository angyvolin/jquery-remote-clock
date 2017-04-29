# jquery-remote-clock

Turns given div element into simple clock displaying remote time.

## basic usage

```html
<div class="clock-holder"></div>
```

```javascript
$('.clock-holder').remoteClock({
    url: '/time'
});
```

## change sync interval

```javascript
$('.clock-holder').remoteClock({
    url: '/time',
    syncInterval: 30000
});
```

## customize widget template

```javascript
$('.server-time-clock').remoteClock({
    url: '/time',
    template: '<i class="fa fa-clock-o" aria-hidden="true"></i> <span class="time">88:88:88</span>'
});
```


## use custom time parser

```javascript
$('.server-time-clock').remoteClock({
    url: '/time',
    parser: function (data) {
        return Date.parse(data.time);
    }
});
```
