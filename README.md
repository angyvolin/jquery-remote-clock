# jquery-remote-clock
Turns given div element into simple clock displaying remote time.

## basic usage

```html
<div class="clock-holder"></div>
```

```javascript
$('.clock-holder').remoteClock({
    url: '/time.php'
});
```

## pass sync interval

```javascript
$('.clock-holder').remoteClock({
    url: '/time.php',
    syncInterval: 30000
});
```
