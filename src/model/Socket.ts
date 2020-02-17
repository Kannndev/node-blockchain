var http = require('http')
var io = require('socket.io')();
io.listen(4001);

export const socketEmit = () => {
    io.on('connection', function (socket) {
        socket.on('join', input => {
            io.emit(input.room, input)
        })
    });
}


export const emit = (room, data) => {
    io.emit(room, data)
}

