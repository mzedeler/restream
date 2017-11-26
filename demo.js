const _ = require('lodash');
const redux = require('redux');
const replug = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');
const stream = require('stream');
const fs = require('fs');
const zlib = require('zlib');

const reducer = (state = {}, { type, ...action } = {}) => {
  switch(type) {
    default:
      return state;
  }
};

const store = redux.createStore(
  reducer,
  redux.applyMiddleware(sagaMiddleware)
);

const actions = replug.actions(store.dispatch);

console.log(replug.actionTypes.stream.READABLE_REGISTER);

function* mySagas() {
  yield effects.takeEvery(
    replug.actionTypes.stream.READABLE_REGISTER,
    function* debug({ id }) {
      yield console.log(id + '!');
      // yield actions.writeHead(id, 400);
      // yield actions.end(id, 'pong');
    }
  );
}

sagaMiddleware.run(mySagas);
actions.stream.readable('input', fs.createReadStream(__filename));
actions.stream.duplex('gzip', zlib.createGzip());
actions.stream.writable('output', fs.createWriteStream(__filename + '.gz'));
actions.stream.pipe('input', 'gzip');
actions.stream.pipe('gzip', 'output');
