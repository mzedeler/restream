const _ = require('lodash');
const { eventChannel } = require('redux-saga');
const {
  call,
  fork,
  put,
  spawn,
  take,
  takeEvery,
} = require('redux-saga/effects');
const actions = require('./actions');
const actionTypes = require('./actionTypes');
const { streams, add } = require('./state');

function* writableSetup(id, stream) {
  const channel = eventChannel((emitter) => {
    stream.on('close', () => emitter(actions.writableClose(id)));
    stream.on('finish', () => emitter(actions.writableFinish(id)));
    stream.on('error', error => emitter(actions.writableError(id, error)));
    stream.on('unpipe', () => emitter(actions.writableUnpipe(id)));
    stream.on('pipe', () => emitter(actions.writablePipe(id)));
    return _.noop;
  });
  yield takeEvery(channel, function* dispatch(action) { yield put(action); });
  yield put(actions.writableRegisterDone(id));
}

function* readableSetup(id, stream) {
  const channel = eventChannel((emitter) => {
    stream.on('end', () => emitter(actions.readableEnd(id)));
    stream.on('finish', () => emitter(actions.readableFinish(id)));
    stream.on('error', error => emitter(actions.readableError(id, error)));
    stream.on('unpipe', () => emitter(actions.readableUnpipe(id)));
    stream.on('pipe', () => emitter(actions.readablePipe(id)));
    return _.noop;
  });
  yield takeEvery(channel, function* dispatch(action) { yield put(action); });
  yield put(actions.readableRegisterDone(id));
}

function* cleanupSaga() {
  const { id } = yield take([
    actionTypes.READABLE_FINISH,
    actionTypes.READABLE_ERROR,
    actionTypes.WRITABLE_CLOSE,
    actionTypes.WRITABLE_ERROR,
  ]);
  delete streams[id];
}

function* registerReadableSaga({ id, stream }) {
  add(id, stream);
  yield readableSetup(id, stream);
}

function* registerWritableSaga({ id, stream }) {
  add(id, stream);
  yield writableSetup(id, stream);
}

function* registerDuplexSaga({ id, stream }) {
  add(id, stream);
  yield readableSetup(id, stream);
  yield writableSetup(id, stream);
}

function* pipeSaga(action) {
  const { readableId, writableId, options } = action;
  const read = streams[readableId];
  const write = streams[writableId];
  try {
    yield call([read, read.pipe], write, options);
    yield put(actions.pipeDone(readableId, writableId));
  } catch (error) {
    yield put(actions.pipeError(readableId, writableId, error));
  }
  yield;
}

let running = false;
function* rootSaga() {
  if (running) {
    // eslint-disable-next-line no-console
    console.error('replug already running. This will lead to unpredictable results.');
  }
  running = true;

  yield spawn(function* listeners() {
    yield fork(cleanupSaga);
    yield takeEvery(actionTypes.WRITABLE_REGISTER, registerWritableSaga);
    yield takeEvery(actionTypes.READABLE_REGISTER, registerReadableSaga);
    yield takeEvery(actionTypes.DUPLEX_REGISTER, registerDuplexSaga);
    yield takeEvery(actionTypes.PIPE, pipeSaga);
  });
}

module.exports = rootSaga;
