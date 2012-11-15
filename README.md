Queue It
========
  Utility to throttle programs which over utilize the spawn function.  Can also be used to throttle functions which need it.

Install
-------
```
npm install queueit
```

Example
-------

```
var QueueIt = require('queueit'),
    q = new QueueIt( {
        max_num_processes : 5
      });

q.start();

for (i = 0; i < 1000; i++) {
  q.push({ 
      command: 'curl',
      arguments: ['google.com'],
      timeout: 1000,
      cb : function (err,data) {
        if (!err && data && data.toString) console.log(data.toString())
        }
      });
}
```

Using Queue It with a random function

```
function random(options, cb) {
  //do something
  ...

  ///callback
  cb(err,data);
}

var QueueIt = require('queueit'),
    q = new QueueIt( {
        max_num_processes : 5,
        func : random
      }); 

q.start();

for (i = 0; i < 1000; i++) {
  //build options
  q.push(options,function () { //do something
    });
}
```
