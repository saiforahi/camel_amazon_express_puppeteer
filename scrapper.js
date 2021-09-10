const schedule = require('./plateform/camel_visitor');
//const schedule = require('./orderSchedule')
//const test = require('./test');
const camel_visitor = async () => {
    schedule();
}
module.exports = camel_visitor;