const {InvalidDocumentConfig} = require("../../errors/errors");

class ProcessorUtils {
    
    static extractDocumentMetadataFromHeaders(req) {
       
        
        const name = req.headers["x-document-name"];
        if(!name) {
            throw new InvalidDocumentConfig({message: "x-document-name header is required"})
        }
        let priority = req.headers["x-document-priority"] || 50;
        if(priority) {
            try {
                const priorityInt = parseInt(priority);
                if(priority <0 || priority > 100) {
                    throw new InvalidDocumentConfig({message: "x-document-priority should be between 0 and 100"})
                }
            } catch (e) {
                throw new InvalidDocumentConfig({message: "x-document-priority should be an integer"})
            }
        }
        const collectionName = req.headers["x-collection-name"];
        if(!collectionName) {
            throw new InvalidDocumentConfig({message: "x-collection-name header is required"})
        }
        const accountId = req.headers["x-account-id"];
        if(!accountId) {
            throw new InvalidDocumentConfig({message: "x-account-id header is required"})
        }
    
        const doc = {
            document: {
                name: name
            },
            accountId: accountId,
            collectionName: collectionName,
            priority: priority
        };
        return doc;
    }
}

module.exports = ProcessorUtils;
