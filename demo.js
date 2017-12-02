const _ = require('lodash');
const redux = require('redux');
const replug = require('.');
const createSagaMiddleware = require('redux-saga').default;
const sagaMiddleware = createSagaMiddleware();
const effects = require('redux-saga/effects');
const stream = require('stream');
const fs = require('fs');
const zlib = require('zlib');
console.log(1);

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
console.log('heps');
console.log(replug.actionTypes);

console.log(replug.actionTypes.restream.READABLE_REGISTER);

function* mySagas() {
  yield effects.takeEvery(
    replug.actionTypes.restream.READABLE_REGISTER,
    function* debug({ id }) {
      yield console.log(id + '!');
      // yield actions.writeHead(id, 400);
      // yield actions.end(id, 'pong');
    }
  );
}

sagaMiddleware.run(mySagas);
actions.restream.readable('input', fs.createReadStream(__filename));
actions.restream.duplex('gzip', zlib.createGzip());
actions.restream.writable('output', fs.createWriteStream(__filename + '.gz'));
actions.restream.pipe('input', 'gzip');
actions.restream.pipe('gzip', 'output');
