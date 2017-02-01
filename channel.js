const Deferred = require('./deferred')

module.exports = class Channel {
  constructor(capacity = 0) {
    this.capacity = capacity
    this.values = []
    this.sends = []
    this.recvs = []
    this.closed = false
  }

  send(value) {
    if (this.closed) {
      return Promise.reject(new Error('send on closed channel'))
    }

    if (this.recvs.length) {
      this.recvs.shift().resolve(value)
      return Promise.resolve()
    }

    if (this.values.length < this.capacity) {
      this.values.push(value)
      return Promise.resolve()
    }

    const promise = new Deferred
    this.sends.push({ value, promise })
    return promise
  }

  recv() {
    if (this.values.length) {
      return Promise.resolve(this.values.shift())
    }

    if (this.sends.length) {
      const send = this.sends.shift()

      if (this.closed) {
        send.promise.reject(new Error('send on closed channel'))
        return Promise.resolve()
      }

      send.promise.resolve()
      return Promise.resolve(send.value)
    }

    if (this.closed) {
      return Promise.resolve()
    }

    const promise = new Deferred
    this.recvs.push(promise)
    return promise
  }

  close() {
    if (this.closed) throw new Error('channel already closed')
    this.closed = true
    const recvs = this.recvs
    this.recvs = []
    recvs.forEach(p => p.resolve())
  }
}
