const actionTypes = require('./actionTypes');

module.exports = {
  duplexRegister(id, stream) { return { type: actionTypes.DUPLEX_REGISTER, id, stream }; },
  duplexRegisterDone(id) { return { type: actionTypes.DUPLEX_REGISTER_DONE, id }; },
  duplexRegisterError(id) { return { type: actionTypes.DUPLEX_REGISTER_ERROR, id }; },

  pipe(readableId, writableId) { return { type: actionTypes.PIPE, readableId, writableId }; },
  pipeDone(readableId, writableId) { return { type: actionTypes.PIPE_DONE, readableId, writableId }; },
  pipeError(readableId, writableId) { return { type: actionTypes.PIPE_ERROR, readableId, writableId }; },

  readableEnd(id) { return { type: actionTypes.READABLE_END, id }; },
  readableError(id) { return { type: actionTypes.READABLE_ERROR, id }; },
  readableFinish(id) { return { type: actionTypes.READABLE_FINISH, id }; },
  readablePipe(id) { return { type: actionTypes.READABLE_PIPE, id }; },
  readableRegister(id, stream) { return { type: actionTypes.READABLE_REGISTER, id, stream }; },
  readableRegisterDone(id) { return { type: actionTypes.READABLE_REGISTER_DONE, id }; },
  readableRegisterError(id) { return { type: actionTypes.READABLE_REGISTER_ERROR, id }; },
  readableUnpipe(id) { return { type: actionTypes.READABLE_UNPIPE, id }; },

  writableClose(id) { return { type: actionTypes.WRITABLE_CLOSE, id }; },
  writableFinish(id) { return { type: actionTypes.WRITABLE_FINISH, id }; },
  writablePipe(id) { return { type: actionTypes.WRITABLE_PIPE, id }; },
  writableRegister(id, stream) { return { type: actionTypes.WRITABLE_REGISTER, id, stream }; },
  writableRegisterDone(id) { return { type: actionTypes.WRITABLE_REGISTER_DONE, id }; },
  writableRegisterError(id) { return { type: actionTypes.WRITABLE_REGISTER, id }; },
  writableUnpipe(id) { return { type: actionTypes.WRITABLE_UNPIPE, id }; },
};
