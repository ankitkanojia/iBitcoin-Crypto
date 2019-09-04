module.exports = class Exception {
  constructor(message, code, type, properties = {}) {
    this.message = message;
    this.errorCode = code;
    this.type = type;

    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        this[key] = properties[key];
      }
    }
  }
}
