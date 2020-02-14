var http = require('http')
var io = require('socket.io')(http);

let socketEmit = function () {
    io.on('connection', function (socket) {
        console.log('socket started');
    });
}

socketEmit();

export const emit = (room, data) => {
    io.emit(room, data)
}

