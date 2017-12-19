const { actions, sagas } = require('.');
const createSagaMiddleware = require('redux-saga').default;
const {
  all,
  fork,
  takeEvery,
  take,
  put,
} = require('redux-saga/effects');
const fs = require('fs');
const zlib = require('zlib');
const configureStore = require('redux-mock-store').default;

const demo = Boolean(process.env.DEMO);

describe('replug', () => {
  it('can provide piping of streams', (done) => {
    function* mySagas() {
      yield fork(sagas);
      if (demo) {
        yield takeEvery(
          '*',
          function* debug({ type, id }) {
            // eslint-disable-next-line no-console
            yield console.log(`${type} ${id}`);
          }
        );
      }

      // Setting up input stream
      const input = fs.createReadStream(__filename);
      yield put(actions.readableRegister('input', input));
      expect(yield take('*')).toMatchSnapshot();

      // Setting up transform stream
      const gzip = zlib.createGzip();
      yield put(actions.duplexRegister('gzip', gzip));
      expect(yield take('*')).toMatchSnapshot();

      // Setting up writable stream (sink)
      const output = fs.createWriteStream('/tmp/replug-test-output.gz');
      yield put(actions.writableRegister('output', output));
      expect(yield take('*')).toMatchSnapshot();

      // Piping input to transform stream
      yield put(actions.pipe('input', 'gzip'));
      expect(yield take('*')).toMatchSnapshot();
      expect(yield take('*')).toMatchSnapshot();

      // Piping transform stream to output
      yield put(actions.pipe('gzip', 'output'));
      expect(yield all({
        outputPipe: yield take('*'),
        pipeDone: yield take('*'),
        inputEnd: yield take('*'),
        gzipFinish: yield take('*'),
        gzipUnpipe: yield take('*'),
        gzipEnd: yield take('*'),
        outputFinish: yield take('*'),
        outputUnpipe: yield take('*'),
        outputClose: yield take('*'),
      })).toMatchSnapshot();

      done();
    }

    const sagaMiddleware = createSagaMiddleware();
    const mockStore = configureStore([sagaMiddleware]);
    mockStore({});
    sagaMiddleware.run(mySagas);
  });
});
