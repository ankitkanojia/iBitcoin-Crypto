function findIndexWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function replaceKeyWithValue(string, replaceArray,replaceArrayValue)
{
    var finalAns = string;

    for (var i = replaceArray.length - 1; i >= 0; i--) {
        finalAns = finalAns.replace(replaceArray[i], replaceArrayValue[i]);

    }

    return finalAns;
}

module.exports = {
    findIndexWithAttr: findIndexWithAttr,
    replaceKeyWithValue: replaceKeyWithValue
};
