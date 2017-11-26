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
  'READABLE_END',
  'READABLE_ERROR',
]);
