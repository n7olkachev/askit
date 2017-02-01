const Deferred = require('./deferred')
const sleep = require('./sleep')

module.exports = class Semaphore {
  constructor (permits = 1) {
    this.permits = permits
    this.enters = 0
    this.waits = []
  }

  wait () {
    if (this.enters >= this.permits) {
      this.enters++
      let promise = new Deferred()
      this.waits.push(promise)

      return promise
    } else {
      this.enters++
    }
  }

  release () {
    if (this.waits.length > 0) {
      this.waits.shift().resolve()
      this.enters--
    }
  }
}
