const _ = require('lodash');

const generateActions = actionNames => (_
  .zipObject(
    actionNames,
    actionNames.map(actionName => `REPLUG_${actionName}`)
  )
);

module.exports = generateActions([
  'WRITABLE_REGISTER',
  'READABLE_REGISTER',
  'DUPLEX_REGISTER',
  'READABLE_PIPE',
  'READABLE_UNPIPE',
  'WRITABLE_PIPE',
  'WRITABLE_UNPIPE',
  'WRITABLE_CLOSE',
  'WRITABLE_FINISH',
  'READABLE_END',
  'READABLE_FINISH',
  'READABLE_ERROR',
]);
