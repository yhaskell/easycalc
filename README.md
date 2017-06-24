easycalc
========

easycalc is a primitive calculator written in typescript.


usage
-----

```
$ npm i -g easycalc

$ easycalc [FILE]
```

When file argument is present, easycalc reads and executes all lines from this file 
and outputs the final answer.

Otherwise, REPL is started.

You can do 2 things in REPL: 
* calculate things
* write them into variables

2 additional variables are present:
* `_` is a result of last computation
* `__precision__` is precision of calculation.


```js
> 5 + 7
12
> -(42 + 58)
-100
> 2 * 1/2
1
> __precision__ = 3
3
> third = 1/3
0.333
> a = 2 + 2 * 2
6
> 3 * third
0.999
> _
0.999
> __vars__
__precision__: 3
third: 0.333
a: 6
>
```



there also is a `__vars__` command (in REPL), that outputs the list of existing variables.

test
----

```
$ npm run test
```
