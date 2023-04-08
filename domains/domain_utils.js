const uuid = require('uuid')
class DomainUtils {
    
    static generateId() {
        const uuid = require('uuid')
        const buffer = Buffer.alloc(16);
        
        uuid.v4({}, buffer);
        return buffer.toString('hex');
    }
}

module.exports = DomainUtils;
