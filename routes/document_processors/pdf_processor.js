const ProcessorUtils = require("./processor_utils");
const {InvalidDocument} = require("../../errors/errors");
class PDFProcessor {
    constructor() {
    }
    
    async generateDocument(req) {
        throw new InvalidDocument({message: "PDFs are not supported by now, look here soon"})
    }
}

module.exports = PDFProcessor;
