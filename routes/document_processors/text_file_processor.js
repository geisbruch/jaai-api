const ProcessorUtils = require("./processor_utils");
//Content-Type: text/plain
class TextFileProcessor {
    constructor() {
    }
    
    async generateDocument(req) {
        const doc = ProcessorUtils.extractDocumentMetadataFromHeaders(req);
        doc.document.content = req.body;
        return doc;
    }
}

module.exports = TextFileProcessor;
