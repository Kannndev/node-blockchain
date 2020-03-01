const io = require('socket.io')();
io.listen(4001);
import { logger } from '../config';

export const socketEmit = () => {
  io.on('connection', socket => {
    socket.on('join', input => {
      io.emit(input.room, input);
    });
  });
};

export const emit = (room, data) => {
  logger.info(data);
  io.emit(room, data);
};
