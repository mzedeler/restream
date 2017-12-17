const _ = require('lodash');

const generateActions = actionNames => (_
  .zipObject(
    actionNames,
    actionNames.map(actionName => `REPLUG_${actionName}`)
  )
);

module.exports = generateActions([
  'DUPLEX_REGISTER',
  'DUPLEX_REGISTER_DONE',
  'DUPLEX_REGISTER_ERROR',
  'PIPE',
  'PIPE_DONE',
  'PIPE_ERROR',
  'READABLE_END',
  'READABLE_ERROR',
  'READABLE_FINISH',
  'READABLE_PIPE',
  'READABLE_REGISTER',
  'READABLE_REGISTER_DONE',
  'READABLE_REGISTER_ERROR',
  'READABLE_UNPIPE',
  'WRITABLE_CLOSE',
  'WRITABLE_FINISH',
  'WRITABLE_PIPE',
  'WRITABLE_REGISTER',
  'WRITABLE_REGISTER_DONE',
  'WRITABLE_REGISTER_ERROR',
  'WRITABLE_UNPIPE',
]);
