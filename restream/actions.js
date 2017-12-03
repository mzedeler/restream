const { Readable, Writable, Duplex } = require('stream');
const actionTypes = require('./actionTypes');

const streams = {};
const add = (id, stream) => {
  if (!streams[id]) {
    streams[id] = stream;
  } else if (streams[id] !== stream) {
    throw new Error('Another stream with this id already exists');
  } // else stream has been registered (streams[id] === stream)
};

class UnrecognizedStreamType extends Error {}

module.exports = (dispatch) => {
  const doneHandler = (id, type) => () => {
    delete streams[id];
    dispatch({ type, id });
  };

  const errorHandler = (id, type) => (error) => {
    delete streams[id];
    dispatch({ type, error, id });
  };

  const eventHandler = (id, type) => () => dispatch({ type, id });

  const readableSetup = (id, stream) => {
    stream.on('end', eventHandler(id, actionTypes.READABLE_END));
    stream.on('finish', doneHandler(id, actionTypes.READABLE_FINISH));
    stream.on('error', errorHandler(id, actionTypes.READABLE_ERROR));
    stream.on('unpipe', eventHandler(id, actionTypes.READABLE_UNPIPE));
    stream.on('pipe', eventHandler(id, actionTypes.READABLE_PIPE));
    dispatch({ type: actionTypes.READABLE_REGISTER, id });
  };

  const writableSetup = (id, stream) => {
    stream.on('close', doneHandler(id, actionTypes.WRITABLE_CLOSE));
    stream.on('finish', doneHandler(id, actionTypes.WRITABLE_FINISH));
    stream.on('error', errorHandler(id, actionTypes.WRITABLE_ERROR));
    stream.on('unpipe', eventHandler(id, actionTypes.WRITABLE_UNPIPE));
    stream.on('pipe', eventHandler(id, actionTypes.WRITABLE_PIPE));
    dispatch({ type: actionTypes.WRITABLE_REGISTER, id });
  };

  const readable = (id, stream) => {
    add(id, stream);
    readableSetup(id, stream);
  };

  const writable = (id, stream) => {
    add(id, stream);
    writableSetup(id, stream);
  };

  const duplex = (id, stream) => {
    add(id, stream);
    readableSetup(id, stream);
    writableSetup(id, stream);
    dispatch({ type: actionTypes.DUPLEX_REGISTER, id });
  };

  const register = (id, stream) => {
    if (stream instanceof Duplex) {
      duplex(id, stream);
    } else if (stream instanceof Readable) {
      readable(id, stream);
    } else if (stream instanceof Writable) {
      writable(id, stream);
    } else {
      throw new UnrecognizedStreamType();
    }
  };

  const pipe = (readableId, writableId, options = {}) => {
    const read = streams[readableId];
    const write = streams[writableId];
    read.pipe(write, options);
    dispatch({
      type: actionTypes.READABLE_PIPE,
      readableId,
      writableId,
      options,
    });
  };

  return {
    register,
    readable,
    writable,
    duplex,
    pipe,
  };
};
