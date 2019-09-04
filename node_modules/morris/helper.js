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
Array.prototype.indexOfKey = function(value, key, start = 0) {
  for (var i = start; i < this.length; i++) {
    if (this[i][key] === value) {
      return i;
    }
  }
  return -1;
}
Array.prototype.objectFromKey = function(value, key, start = 0) {
  var index = this.indexOfKey(value, key, start);
  var item = this[index];
  //item.__index = index;
  return item;
}
/*
String.prototype.repeat = function(count) {
  var str = "";
  for (var i = 0; i < count; i++) {
    str += this;
  }
  return this;
};*/
