const DomainUtils = require("../domains/domain_utils");
const {AccountStatus} = require("../domains/account");
const {EntityNotFoundException} = require("../errors/errors");
const ServiceUtils = require("./service_utils");

class AccountService {
    constructor(accountModel, documentsBucket) {
        this.accountModel = accountModel;
        this.documentsBucket = documentsBucket;
    }
    
    async create({name}) {
        const id = DomainUtils.generateId();
        const account = {
            id,
            name,
            status:
            AccountStatus.ACTIVE,
            documentsRepositoryUrl: `${this.documentsBucket}/${id}`
        };
        const createdAccount =  await this.accountModel.create(account);
        return ServiceUtils.dbObjectToObject(createdAccount,["id", "status", "name", "suspendedMessage", "documentsRepositoryUrl"]);
    }
    
    async getById(id) {
        const account = this.accountModel.findByPk(id);
        return account;
    }
}

module.exports = {AccountService};
