describe('replug', () => {
  it('can provide piping of streams', (done) => {
    const replug = require('.');
    const createSagaMiddleware = require('redux-saga').default;
    const sagaMiddleware = createSagaMiddleware();
    const effects = require('redux-saga/effects');

    const fs = require('fs');
    const zlib = require('zlib');
    const configureStore = require('redux-mock-store').default;

    const mockStore = configureStore([sagaMiddleware]);
    const store = mockStore({});
    const actions = replug.actions(store.dispatch);

    function* mySagas() {
      yield effects.takeEvery(
        replug.actionTypes.restream.READABLE_REGISTER,
        function* debug({ id }) {
          // yield console.log(`${id}!`);
        }
      );
      yield effects.takeEvery(
        '*',
        function* debug({ type, id }) {
          yield console.log(`${type} ${id}`);
        }
      );
    }

    sagaMiddleware.run(mySagas);
    const input = fs.createReadStream(__filename);
    input.on('data', () => console.log('end'));
    actions.restream.readable('input', input);
    actions.restream.duplex('gzip', zlib.createGzip());
    const output = fs.createWriteStream(`${__filename}.gz`);
    actions.restream.writable('output', output);
    actions.restream.pipe('input', 'gzip');
    actions.restream.pipe('gzip', 'output');
    output.on('close', done);
  });
});
