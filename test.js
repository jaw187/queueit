var QueueIt = require('./'),
    q = new QueueIt( {
        max_num_processes :  10001,
        wait: 1
      }); 

q.start();
var responses=1;

for (i = 0; i < 100000; i++) {
  q.push({ 
      command: 'ping',
      arguments: ['-c 1','8.8.8.8'],
      timeout: 1000,
      cb : function (err,data) {
//        if (!err && data) { console.log(responses++); }
//        if (err && err.toString) console.log(err.toString());
        }   
      }); 
}
