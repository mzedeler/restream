const { actions, actionTypes, sagas } = require('.');
const createSagaMiddleware = require('redux-saga').default;
const {
  fork,
  takeEvery,
  take,
  put,
} = require('redux-saga/effects');
const fs = require('fs');
const zlib = require('zlib');
const configureStore = require('redux-mock-store').default;

describe('replug', () => {
  it('can provide piping of streams', (done) => {

    function* mySagas() {
      console.log('running mySagas');
      yield fork(sagas);
      yield takeEvery(
        actionTypes.READABLE_REGISTER,
        function* debug({ id }) {
          yield console.log(`${id}!`);
        }
      );
      yield takeEvery(
        '*',
        function* debug({ type, id }) {
          yield console.log(`${type} ${id}`);
        }
      );

      const input = fs.createReadStream(__filename);
      input.on('data', () => console.log('end'));
      yield put(actions.readableRegister('input', input));

      yield put(actions.duplexRegister('gzip', zlib.createGzip()));

      const output = fs.createWriteStream(`/tmp/replug-test-output.gz`);
      yield put(actions.writableRegister('output', output));

      yield put(actions.pipe('input', 'gzip'));
      yield put(actions.pipe('gzip', 'output'));

      while (true) {
        const { id } = yield take(actionTypes.WRITABLE_CLOSE);
        id === 'output' && done();
      }
    }

    console.log(1);

    const sagaMiddleware = createSagaMiddleware();
    const mockStore = configureStore([sagaMiddleware]);
    console.log(2);
    const store = mockStore({});
    sagaMiddleware.run(mySagas);
    console.log(store);
  });
});
