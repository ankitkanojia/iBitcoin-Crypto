Array.prototype.fill = function(callback = i => true) {
  for (var i = 0; i < this.length; i++) {
    this[i] = callback(i);
  }
  return this;
}
Object.prototype.fillDefaults = function(defaults) {
  Object.keys(defaults).forEach(key => {
    if (!(key in this)) {
      this[key] = defaults[key];
    }
    else if (typeof defaults[key] == "object" && defaults[key] != null) {
      this[key] = this[key].fillDefaults(defaults[key]);
    }
  });
  return this;
}
