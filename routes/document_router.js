const BASE_PATH = "/document";
const {constants} = require("http2");
const {ERROR_TYPES, InvalidDocumentConfig} = require("../errors/errors");

class CollectionRouter {
    constructor(documentService, processors) {
        this.documentService = documentService;
        this.processors = processors;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            
            try {
                const contentType = req.headers["content-type"];
                const processor = this.processors[contentType];
                if(!processor) {
                    throw new InvalidDocumentConfig({message: `Document type [${contentType}] unknown`})
                }
                
                const data = await processor.generateDocument(req);
                const document = await this.documentService.create(data);
             
                res.status(constants.HTTP_STATUS_OK);
                const ret = {
                    id: document.id,
                    status: document.status,
                    name: document.name,
                    collectionId: document.collectionId
                }
                res.send(ret);
            }catch (e) {
                console.log(e);
                if(Object.values(ERROR_TYPES).indexOf(e.name)) {
                    res.status(constants.HTTP_STATUS_PRECONDITION_FAILED)
                    res.send({error: e.message});
                } else {
                    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
                    res.send({error: "Internal error"});
                }
            }
    
        })
        
    }
}

module.exports = CollectionRouter;
