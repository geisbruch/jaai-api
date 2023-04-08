var SimpleCache = require("simple-lru-cache")

class ChatStorageService {
    //By now only a simple lru cache
    constructor() {
        this.cache = new SimpleCache({"maxSize":1000})
    }
    
    appendMessages(chatId, messages) {
        const cached = this.cache.get(chatId)
        if(!cached) {
            this.cache.set(chatId, messages);
        } else {
            cached.unshift(...messages);
        }
    }
    
    retrieveMessages(chatId) {
        return this.cache.get(chatId);
    }
}
