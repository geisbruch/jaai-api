const {InvalidDocumentConfig} = require("../../errors/errors");

//Content-Type: application/json
class JsonProcessor {

    constructor() {
    }
    
    async generateDocument(req) {
        const document = req.body;
        
        if(!document.accountId) {
            throw new InvalidDocumentConfig({message: "accountId is required"})
        }
    
        if(!document.collectionName) {
            throw new InvalidDocumentConfig({message: "collectionName is required"})
        }
        if(!document.document || !document.document.content || !document.document.name) {
            throw new InvalidDocumentConfig({message: "document.content and docuemnt.name are required"})
        }
        return document;
    }
}

module.exports = JsonProcessor;
