// an approach to separate socket logic out of ./bin/www file and ./app.js files
// REF: https://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www

const socketServer = require('socket.io');
const io = socketServer();
const socketApi = {};

socketApi.io = io;
io.on('connection', function(socket) {
  console.log(`Connected to socket - ${socket.id}`);

  socket.on('disconnect', function() {
    console.log(`Disconnected from socket - ${socket.id}`)
  });

  socket.on('POST_COMMENT', (payload) => {
    console.log(`There is a comment update (added or deleted) at thoIndex ${payload}`);
    io.sockets.emit('POST_COMMENT', payload);
  })

  socket.on('get comments', function(thoIndex) {
    //getting comments of PATH_TO_INDEX
    console.log(`get new comments for tho number ${thoIndex} - using api call`);
    //emit event refresh commentState
    socket.emit('refresh comments', {index: thoIndex});
  })

});

// socketApi.sendNotification = function() {
//   io.sockets.emit('hello1', {msg: 'Hello World!'});
// }

module.exports = socketApi;
