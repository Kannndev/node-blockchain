var http = require('http')
var io = require('socket.io')();
io.listen(4001);

export const socketEmit = () => {
    io.on('connection', function (socket) {
        console.log('socket started');
        socket.on('join', input => {
            console.log("sssssssss", input)
            io.emit(input.room, input)
        })
    });
}


export const emit = (room, data) => {
    console.log('scoket');
    io.emit(room, data)
}

