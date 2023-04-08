const BASE_PATH = "/chat";
const {constants} = require("http2");
const jq = require('node-jq')
const {ERROR_TYPES} = require("../errors/errors");

class CollectionRouter {
    constructor(documentService) {
        this.chatService = chatService;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            const data = req.body;
            try {
                const chat = await this.chatService.startChat(data);
    
                res.status(constants.HTTP_STATUS_OK);
                res.send(chat);
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
    
        app.post(`BASE_PATH/:chatId`, async (req, res) => {
            const data = req.body;
            try {
                const chat = await this.chatService.continueChat(req.params.chatId, req.data);
            
                res.status(constants.HTTP_STATUS_OK);
                res.send(chat);
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
