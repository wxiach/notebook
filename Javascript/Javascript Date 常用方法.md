# Javascript Date 常用方法

> 以下只是 `Date` 对象的一部分用法，还有更多的方法和属性可以参考 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) 来了解。

## 创建日期

你可以创建一个新的 `Date` 对象来获取当前的日期和时间：

```Javascript
let now = new Date();
console.log(now);  // 输出当前的日期和时间
```

你也可以创建一个特定的日期：

```Javascript
let date = new Date('2023-07-17T00:00:00');
console.log(date);  // 输出 2023-07-17T00:00:00
```

## 获取和设置日期的组成部分

`Date` 对象有很多方法可以获取和设置日期的组成部分，例如：

```Javascript
let date = new Date();

console.log(date.getFullYear());  // 获取年份
console.log(date.getMonth());  // 获取月份，注意月份是从0开始的，所以1代表2月
console.log(date.getDate());  // 获取日期，也就是月份的第几天
console.log(date.getDay());  // 获取星期几，0代表星期日，1代表星期一，依此类推

date.setFullYear(2023);  // 设置年份
date.setMonth(6);  // 设置月份，6代表7月
date.setDate(17);  // 设置日期，也就是月份的第几天
```

## 格式化日期

你可以使用 `toLocaleDateString`、`toLocaleTimeString` 和 `toLocaleString` 这些方法来格式化日期：

```Javascript
let date = new Date();

console.log(date.toLocaleDateString());  // 输出日期，例如 "7/17/2023"
console.log(date.toLocaleTimeString());  // 输出时间，例如 "10:30:00 AM"
console.log(date.toLocaleString());  // 输出日期和时间，例如 "7/17/2023, 10:30:00 AM"
```

## 日期的计算

你可以使用 `getTime` 方法来获取日期的时间戳（从1970-1-1 00:00:00 UTC到当前日期的毫秒数），然后进行日期的计算：

```Javascript
let date1 = new Date('2023-07-17T00:00:00');
let date2 = new Date();

let diff = date2.getTime() - date1.getTime();  // 时间戳的差值
let diffDays = diff / (1000 * 60 * 60 * 24);  // 差值转换为天数

console.log(diffDays);  // 输出两个日期之间的天数
```
