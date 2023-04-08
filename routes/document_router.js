const BASE_PATH = "/document";
const {constants} = require("http2");
const jq = require('node-jq')
const {ERROR_TYPES} = require("../errors/errors");

class CollectionRouter {
    constructor(documentService) {
        this.documentService = documentService;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            const data = req.body;
            try {
                const account = await this.documentService.create(data);
    
                res.status(constants.HTTP_STATUS_OK);
                res.send(await jq.run(". | {id, status, name}", account, {input: "json", output: "json"}));
            }catch (e) {
                console.log(e);
                if(e.name === ERROR_TYPES.EntityNotFoundException) {
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
