const SimpleCache = require("simple-lru-cache")
const _ = require("lodash");
class InMemoryChatStorageService {
    //By now only a simple lru cache
    constructor() {
        this.cache = new SimpleCache({"maxSize":1000})
    }
    
    appendMessages(chatId, messages) {
        const cached = this.cache.get(chatId)
        if(!cached) {
            this.cache.set(chatId, messages);
        } else {
            cached.push(messages[messages.length-2],messages[messages.length-1]);
        }
    }
    
    retrieveMessages(chatId) {
        return _.cloneDeep(this.cache.get(chatId));
    }
}

module.exports = InMemoryChatStorageService;
