function noOp() {};

exports.CleanExit = function CleanExit(callback) {
  callback = callback || noOp;
  process.on('cleanup', callback);

  process.on('exit', function() {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function() {
    console.log('Ctrl-C...');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
  });
};
