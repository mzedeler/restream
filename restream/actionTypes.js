const _ = require('lodash');

const generateActions = actionNames => (_
  .zipObject(
    actionNames,
    actionNames.map(actionName => `REPLUG_${actionName}`)
  )
);

module.exports = generateActions([
  'DUPLEX_REGISTER',
  'READABLE_END',
  'READABLE_ERROR',
  'READABLE_FINISH',
  'READABLE_PIPE',
  'READABLE_REGISTER',
  'READABLE_UNPIPE',
  'WRITABLE_CLOSE',
  'WRITABLE_FINISH',
  'WRITABLE_PIPE',
  'WRITABLE_REGISTER',
  'WRITABLE_UNPIPE',
]);
