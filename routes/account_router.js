const BASE_PATH = "/account";
const {constants} = require("http2");

class AccountRouter {
    constructor(accountService) {
        this.accountService = accountService;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            const data = req.body;
            const account = await this.accountService.create(data);
            
            res.status(constants.HTTP_STATUS_OK);
            res.send(account);
    
        })
        
    }
}

module.exports = AccountRouter;
