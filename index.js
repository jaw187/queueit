var spawn = require('child_process').spawn,
    os = require('os');

var MAX_NUM_PROCESSES = 500,
    WAIT = 10;

module.exports = QueueIt;

function QueueIt(init) {
  this.MAX_NUM_PROCESSES = (init && init.max_num_processes) ? init.max_num_processes : MAX_NUM_PROCESSES;
  this.WAIT = (init && init.wait) ? init.wait : WAIT;

  this.queue = [];
  this.runningProcesses = [];
  this.active = false;

  this.func = (init && init.func) ? init.func : false;
  if (this.func && typeof this.func !== "function") {
    //not sure how I feel about this...
    throw "QUEUEIT INIT FUNC MUST BE function";
  }

  self=this;

  this.go = function () {
    if (self.queue.length > 0 && self.runningProcesses.length < self.MAX_NUM_PROCESSES) {
      var next = self.queue.shift(),
          pid = self.runningProcesses.push(0);
    
      if (self.func) {
        self.call(pid,next);
      }
      else {
        self.spawn(next.command, next.arguments, next.timeout, next.cb, pid);
      }

      self.wait();
    }
    else {
      self.wait();
    }
  }

  this.wait = function () {
    if (self.active) setTimeout(self.go,self.WAIT);
  }

  this.start = function() {
    var go = (!self.active);
    self.active = true;
    if (go) self.go();
  }

  this.stop = function() {
    self.active = false;
  }

  this.push = function () {
    if (this.func) {
      self.queue.push(arguments);
    }
    else { 
      // arguments[0] = options = {
      //  command,
      //  arguments,
      //  timeout
      // }
      if (!arguments[0].timeout) arguments[0].timeout = 0;
      self.queue.push(arguments[0]);
    }
  }

  function dequeue(pid) {
    if (self.runningProcesses.length !== 0) self.runningProcesses = self.runningProcesses.slice(0,pid-1).concat(self.runningProcesses.slice(pid+1,self.runningProcesses.length));
  } 

  this.call = function (pid,args) {
    var cb = args[args.length-1],
        cbcb = function () {
          // Dequeue then call callback with random length of arguments
          dequeue(pid);
          switch (arguments.length) {
          case 1 : cb(arguments[0]); break;
          case 2 : cb(arguments[0],arguments[1]); break;
          case 3 : cb(arguments[0],arguments[1],arguments[2]); break;
          case 4 : cb(arguments[0],arguments[1],arguments[2],arguments[3]); break;
          case 5 : cb(arguments[0],arguments[1],arguments[2],arguments[3], arguments[4]); break;
          } 
        }

    switch (args.length) {
    case 1 : self.func(cbcb); break;
    case 2 : self.func(args[0],cbcb); break;
    case 3 : self.func(args[0],args[1], cbcb); break;
    case 4 : self.func(args[0],args[1], args[2], cbcb); break;
    case 5 : self.func(args[0],args[1], args[2], args[3], cbcb); break;
    }
  }

  this.spawn = function (command,arguments,timeout,cb,pid) {
    var proc = spawn(command,arguments);
    if (timeout > 0) setTimeout(function () { proc.kill('SIGHUP'); }, timeout) 
    proc.stdout.on('data', function (data) {
        cb(null,data);
      }); 

    proc.stderr.on('data', function (data) {
        cb(data)
      }); 

    proc.on('exit', function (code) {
        dequeue(pid);
        cb(null);
      }); 
  }
}
