const BASE_PATH = "/collection";
const {constants} = require("http2");
const {ERROR_TYPES} = require("../errors/errors");

class CollectionRouter {
    constructor(collectionService) {
        this.collectionService = collectionService;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            const data = req.body;
            try {
                const account = await this.collectionService.create(data);
    
                res.status(constants.HTTP_STATUS_OK);
                const ret = {
                    id: account.id,
                    status: account.status,
                    name: account.name
                }
                res.send(ret);
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
