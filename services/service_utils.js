class ServiceUtils {
    
    static dbObjectToObject(dbObject, fields) {
        const ret = {};
        
        for(const field of fields) {
            ret[field] = dbObject[field];
        }
        return ret;
    }
}

module.exports = ServiceUtils;
