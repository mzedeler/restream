const _ = require('lodash');
const { eventChannel } = require('redux-saga');
const { call, put, takeEvery } = require('redux-saga/effects');
const driver = require('./driver');
const actionTypes = require('./actionTypes');

const { streams } = require('./state');

function* pipeSaga({ readableId, writableId, options }) {
  const read = streams[readableId];
  const write = streams[writableId];
  yield read.pipe(write, options);
}

const bindActions = (dispatch, actions) => _
  .cloneDeepWith(actions, (value) => { // eslint-disable-line consistent-return
    if (typeof value === 'function') {
      return (...args) => _.spread(value)(args)(dispatch);
    }
  });

let driverEmitter = _.noop;
function* initSaga() {
  const channel = eventChannel((emitter) => {
    driverEmitter = emitter;
    return _.noop;
  });
  yield takeEvery(channel, function* bridge(action) { yield put(action); });
}

function* rootSaga() {
  yield call(initSaga);
  yield takeEvery(actionTypes.READABLE_PIPE, pipeSaga);
}

_.assign(rootSaga, bindActions((...args) => _.spread(driverEmitter)(args), driver.actions));

module.exports = rootSaga;
