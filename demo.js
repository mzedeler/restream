const _ = require('lodash');
const redux = require('redux');
const replug = require('.');
const createSagaMiddleware = require('redux-saga').default;
const effects = require('redux-saga/effects');
const fs = require('fs');
const zlib = require('zlib');

const sagaMiddleware = createSagaMiddleware();

const reducer = (state = {}, { type, ...action } = {}) => {
  console.log(`${type}: ${action.id}`); // eslint-disable-line no-console
  switch (type) {
    default:
      return state;
  }
};

const store = redux.createStore(
  reducer,
  redux.applyMiddleware(sagaMiddleware)
);

const bindActions = (dispatch, getState, actions) => _
  .cloneDeepWith(actions, (value) => { // eslint-disable-line consistent-return
    if (typeof value === 'function') {
      return (...args) => _.spread(value)(args)(dispatch, getState);
    }
  });

const actions = bindActions(store.dispatch, store.getState, replug.actions);

function* mySagas() {
  yield effects.takeEvery(
    () => true,
    function* debug(action) {
      yield console.log(action);
    }
  );
  yield effects.takeEvery(
    replug.actionTypes.restream.READABLE_REGISTER,
    function* debug({ id }) {
      yield console.log(`Readable: ${id}`); // eslint-disable-line no-console
    }
  );
  yield effects.takeEvery(
    replug.actionTypes.restream.WRITABLE_REGISTER,
    function* debug({ id }) {
      yield console.log(`Writable: ${id}`); // eslint-disable-line no-console
    }
  );
}

sagaMiddleware.run(mySagas);
actions.restream.readable('input', fs.createReadStream(__filename));
actions.restream.duplex('gzip', zlib.createGzip());
actions.restream.writable('output', fs.createWriteStream(__filename + '.gz'));
actions.restream.pipe('input', 'gzip');
actions.restream.pipe('gzip', 'output');
