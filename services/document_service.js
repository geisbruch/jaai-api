const {InvalidDocument} = require("../errors/errors");
const DomainUtils = require("../domains/domain_utils");
const {DocumentStatus} = require("../domains/document");

class DocumentService {
    constructor(documentDomain, collectionService, accountService, searchService) {
        this.documentDomain = documentDomain;
        this.collectionService = collectionService;
        this.accountService = accountService;
        this.searchService = searchService;
    
    }
    
    async create({accountId,collectionName,document}) {
        let collections = await this.collectionService.getByName({name: collectionName, accountId})
        if(collections.length === 0) {
            collections = [await this.collectionService.create({name: collectionName, accountId})];
        }
        const collection = collections[0];
        const account = await this.accountService.getById(accountId);
        
        const id = DomainUtils.generateId();
        document.id = id;
        document.collectionId = collection.id;
        
        if(!document.name) {
            throw new InvalidDocument({message: "document should contains name"})
        }
        
        if(!document.content) {
            throw new InvalidDocument({message: "document should contain 'content'"})
        }
    
        if(document.priority) {
            if(document.priority < 0 || document.priority > 100) {
                throw new InvalidDocument({message: "document priority should be 0<= priority <= 100"})
            }
        } else {
            document.priority = 50;
        }
        document.documentUrl = `${account.documentsRepositoryUrl}${collection.documentsBasePath}/${id}`;
        document.status = DocumentStatus.CREATED;
        //this.objectService.upload(document)
        await this.searchService.indexDocument({index: collection.documentsIndexName, document, accountId: account.id});
        return await this.documentDomain.create(document);
        
    }
    
    async updateDocument({accountId, collectionId, documentId, document}) {
        //Validate document
        //Validate mimetype
        //Update
        //Upload data
        //Send to index
    }
    
    async deleteDocument({accountId, collectionId, documentId}) {
        //Send document to be deleted
        //Update status
    }
    
    async listDocuments({accountId, collectionId, limit, offset}) {
        //Query for documents
    }
}

module.exports = {DocumentService}
