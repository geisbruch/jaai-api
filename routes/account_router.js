const BASE_PATH = "/account";
const {constants} = require("http2");
const jq = require('node-jq')

class AccountRouter {
    constructor(accountService) {
        this.accountService = accountService;
    }
    
    async configure(app) {
        app.post(BASE_PATH, async (req, res) => {
            const data = req.body;
            const account = await this.accountService.create(data);
            
            res.status(constants.HTTP_STATUS_OK);
            res.send(await jq.run(". | {id, status, name}", account, {input: "json", output: "json"}));
    
        })
        
    }
}

module.exports = AccountRouter;
