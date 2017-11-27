const { Readable, Writable, Duplex } = require('stream');
const actionTypes = require('./actionTypes');

const streams = {};
const register = (id, stream) => {
  if (!streams[id]) {
    streams[id] = stream;
  } else if (streams[id] !== stream) {
    throw new Error('Another stream with this id already exists');
  } // else stream has been registered (streams[id] === stream)
};

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
    stream.on('end', () => console.log('finished!!'));
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

  return {
    // TODO
    // register(id, stream) { ... }
    readable(id, stream) {
      if (stream instanceof Readable) {
        register(id, stream);
        readableSetup(id, stream);
      }
    },
    writable(id, stream) {
      if (stream instanceof Writable) {
        register(id, stream);
        writableSetup(id, stream);
      }
    },
    duplex(id, stream) {
      if (stream instanceof Duplex) {
        register(id, stream);
        readableSetup(id, stream);
        writableSetup(id, stream);
        dispatch({ type: actionTypes.DUPLEX_REGISTER, id });
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
