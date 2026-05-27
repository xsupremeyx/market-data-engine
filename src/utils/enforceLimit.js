function enforceLimit(
    deque,
    maxSize
){

    while(deque.length > maxSize){
        deque.shift();
    }
}

module.exports = {
    enforceLimit,
};