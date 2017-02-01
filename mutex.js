const Semaphore = require('./semaphore')

module.exports = class Mutex extends Semaphore {
  constructor () {
    super(1)
  }
}
