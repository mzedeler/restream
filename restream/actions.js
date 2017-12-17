const { Readable, Writable, Duplex } = require('stream');
const actionTypes = require('./actionTypes');
const { streams, add } = require('../state');

class UnrecognizedStreamType extends Error {}

const doneHandler = (dispatch, id, type) => () => {
  delete streams[id];
  dispatch({ type, id });
};

const errorHandler = (dispatch, id, type) => (error) => {
  delete streams[id];
  dispatch({ type, error, id });
};

const eventHandler = (dispatch, id, type) => () => dispatch({ type, id });

const readableSetup = (id, stream) => (dispatch) => {
  stream.on('end', eventHandler(dispatch, id, actionTypes.READABLE_END));
  stream.on('finish', doneHandler(dispatch, id, actionTypes.READABLE_FINISH));
  stream.on('error', errorHandler(dispatch, id, actionTypes.READABLE_ERROR));
  stream.on('unpipe', eventHandler(dispatch, id, actionTypes.READABLE_UNPIPE));
  stream.on('pipe', eventHandler(dispatch, id, actionTypes.READABLE_PIPE));
  dispatch({ type: actionTypes.READABLE_REGISTER, id });
};

const writableSetup = (id, stream) => (dispatch) => {
  stream.on('close', doneHandler(dispatch, id, actionTypes.WRITABLE_CLOSE));
  stream.on('finish', doneHandler(dispatch, id, actionTypes.WRITABLE_FINISH));
  stream.on('error', errorHandler(dispatch, id, actionTypes.WRITABLE_ERROR));
  stream.on('unpipe', eventHandler(dispatch, id, actionTypes.WRITABLE_UNPIPE));
  stream.on('pipe', eventHandler(dispatch, id, actionTypes.WRITABLE_PIPE));
  dispatch({ type: actionTypes.WRITABLE_REGISTER, id });
};

const readable = (id, stream) => (dispatch) => {
  add(id, stream);
  readableSetup(id, stream)(dispatch);
};

const writable = (id, stream) => (dispatch) => {
  add(id, stream);
  writableSetup(id, stream)(dispatch);
  console.log('done');
};

const duplex = (id, stream) => (dispatch) => {
  add(id, stream);
  readableSetup(id, stream)(dispatch);
  writableSetup(id, stream)(dispatch);
  dispatch({ type: actionTypes.DUPLEX_REGISTER, id });
};

const register = (id, stream) => (dispatch) => {
  if (stream instanceof Duplex) {
    duplex(id, stream)(dispatch);
  } else if (stream instanceof Readable) {
    readable(id, stream)(dispatch);
  } else if (stream instanceof Writable) {
    writable(id, stream)(dispatch);
  } else {
    throw new UnrecognizedStreamType();
  }
};

const pipe = (readableId, writableId, options = {}) => (dispatch) => {
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

module.exports = {
  register,
  readable,
  writable,
  duplex,
  pipe,
};
