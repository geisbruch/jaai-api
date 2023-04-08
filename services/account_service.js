const DomainUtils = require("../domains/domain_utils");
const {AccountStatus} = require("../domains/account");
const {EntityNotFoundException} = require("../errors/errors");
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
        return createdAccount;
    }
    
    async getById(id) {
        const account = this.accountModel.findByPk(id);
        return account;
    }
}

module.exports = {AccountService};
