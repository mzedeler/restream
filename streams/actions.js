const { Readable, Writable, Duplex } = require('stream');
const actionTypes = require('./actionTypes');

const streams = {};

let currentId = 0;
const nextid = () => { currentId += 1; return currentId; };

module.exports = (dispatch) => {
  const doneHandler = (id, type) => () => {
    delete streams[id];
    dispatch({ type });
  };

  const errorHandler = (id, type) => (error) => {
    delete streams[id];
    dispatch({ type, error });
  };

  const eventHandler = (id, type) => () => dispatch({ type, id });

  const internalReadable = (stream, id) => {
    if (stream instanceof Readable) {
      stream.on('end', eventHandler(id, actionTypes.READABLE_END));
      stream.on('finish', doneHandler(id, actionTypes.READABLE_FINISH));
      stream.on('error', errorHandler(id, actionTypes.READABLE_ERROR));
      stream.on('unpipe', eventHandler(id, actionTypes.READABLE_UNPIPE));
      stream.on('pipe', eventHandler(id, actionTypes.READABLE_PIPE));
      streams[id] = stream;
      dispatch({ type: actionTypes.READABLE_REGISTER, id: currentId });
    }
  };

  const internalWritable = (stream, id) => {
    if (stream instanceof Writable) {
      stream.on('close', doneHandler(id, actionTypes.WRITABLE_CLOSE));
      stream.on('finish', doneHandler(id, actionTypes.WRITABLE_FINISH));
      stream.on('error', errorHandler(id, actionTypes.WRITABLE_ERROR));
      stream.on('unpipe', eventHandler(id, actionTypes.WRITABLE_UNPIPE));
      stream.on('pipe', eventHandler(id, actionTypes.WRITABLE_PIPE));
      streams[id] = stream;
      dispatch({ type: actionTypes.WRITABLE_REGISTER, id: currentId });
    }
  };

  return {
    readable(stream) {
      internalReadable(stream, nextid());
    },
    writable(stream) {
      internalWritable(stream, nextid());
    },
    duplex(stream) {
      if (stream instanceof Duplex) {
        streams[nextid()] = stream;
        internalReadable(stream, currentId);
        internalWritable(stream, currentId);
        dispatch({ type: actionTypes.DUPLEX_REGISTER, id: currentId });
      }
    },
    pipe(readableId, writableId, options = {}) {
      const read = streams[readableId];
      const write = streams[writableId];
      if (read instanceof Readable && write instanceof Writable) {
        read.pipe(write, options);
        dispatch({
          type: actionTypes.READABLE_PIPE,
          readableId,
          writableId,
          options,
        });
      }
    },
  };
};
