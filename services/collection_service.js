const DomainUtils = require("../domains/domain_utils");
const {CollectionStatus} = require("../domains/collection");
const {EntityNotFoundException} = require("../errors/errors");
class CollectionService {
    constructor(collectionModel, accountService, searchService) {
        this.collectionModel = collectionModel;
        this.accountService = accountService;
        this.searchService = searchService;
    }
    
    async create({name, accountId}) {
        const account = await this.accountService.getById(accountId)
        if(!account) {
            throw new EntityNotFoundException({message: `Account ${accountId} not found`});
        }
        const existingCollectionName = await this.getByName({name, accountId});
        if(existingCollectionName.length > 0) {
            throw new EntityNotFoundException({message: `Existing collection ${name} for Account ${accountId} not found`});
        }
        const id = DomainUtils.generateId();
        const collection = {
            id,
            name,
            status: CollectionStatus.ACTIVE,
            accountId,
            documentsIndexName: `${accountId}-${id}`,
            documentsBasePath: `/${id}`
        };
        this.searchService.createIndex(collection.documentsIndexName);
        const createdCollection =  await this.collectionModel.create(collection);
        return createdCollection;
    }
    
    async getByName({name, accountId}) {
        return await this.collectionModel.findAll({
            where: {
                accountId,name
            }
        })
    }
    
    async getById(id) {
        const collection = this.collectionModel.findByPk(id);
        return collection;
    }
}

module.exports = {CollectionService};
