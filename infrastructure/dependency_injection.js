const { Client } = require('@opensearch-project/opensearch');
const { Configuration, OpenAIApi } = require("openai");

const { Sequelize } = require("@sequelize/core");
const {defineModel: defineDocumentFunction} = require("../domains/document");
const {defineModel: defineCollectionFunction} = require("../domains/collection");
const {defineModel: defineAccountFunction} = require("../domains/account");

// Routers definitions
const Router = require("../routes/router");
const AccountRouter = require("../routes/account_router");
const CollectionRouter = require("../routes/collection_router");
const DocumentRouter = require("../routes/document_router");

// Services definitions
const {AccountService} = require("../services/account_service");
const {CollectionService} = require("../services/collection_service");
const SearchService = require("../services/search_service");
const {DocumentService} = require("../services/document_service");
const ChatService = require("../services/chat_service");

const dependencies = {}
let loaded = false;
class DependencyManager {
    
    static async loadCommons(context) {
        dependencies["domains"] = {};
        dependencies["commands"] = {};
        dependencies["services"] = {};
    }
    
    static async loadDev(context) {
        const sequelize = new Sequelize('sqlite::memory:', {
            dialect: 'sqlite',
            logging: false // Disable logging to the console
        });
        
        dependencies["sequelize"] = sequelize;
        
        dependencies["commands"].start = () => {
            const app = dependencies.router.getApp();
            const port = 3000 || process.env["PORT"];
            dependencies["server"] = app.listen(port, () => {
                console.log(`Example app listening on port ${port}`)
            });
            dependencies["app"] = app;
        }
        dependencies["commands"].stop = () => {
            dependencies["server"].close();
        }
    
        dependencies.opensearchClient = new Client({
            node: "http://localhost:9200"
        })
        
    }
    
    static async loadProd(context) {
    
    }
    
    static async loadCommonsAfterEnv(context) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY || "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",
        });
        dependencies.openiaClient = new OpenAIApi(configuration);
        
        dependencies.domains.Document = defineDocumentFunction(dependencies.sequelize);
        dependencies.domains.Account = defineAccountFunction(dependencies.sequelize);
        dependencies.domains.Collection = defineCollectionFunction(dependencies.sequelize);
    
        
        if(context.env === "dev") {
            for(const domain of Object.keys(dependencies.domains)) {
                await dependencies.domains[domain].sync({ force: true });
            }
        }
        
        const accountService = new AccountService(dependencies.domains.Account, "s3://demo-bucket");
        const searchService = new SearchService(dependencies.opensearchClient, dependencies.openiaClient);
        const collectionService = new CollectionService(dependencies.domains.Collection, accountService, searchService);
        const documentService = new DocumentService(dependencies.domains.Document, collectionService, accountService, searchService);
        const chatService = new ChatService(searchService, dependencies.openiaClient, accountService, collectionService);
        dependencies.services = {
            accountService, searchService, collectionService, documentService, chatService
        }
        
        const accountRouter = new AccountRouter(accountService);
        const collectionRouter = new CollectionRouter(collectionService);
        const documentRouter = new DocumentRouter(documentService)
        
        dependencies.router = new Router({routers:[accountRouter, collectionRouter, documentRouter]});
        await dependencies.router.configure();
    
    }
    
    static async init(context = {env:"dev"}) {
        const {env} = context;
        await this.loadCommons(context);
        if(["test","dev"].indexOf(env.toLowerCase()) > -1) {
            await this.loadDev(context);
        } else {
            await this.loadProd(context);
        }
        await this.loadCommonsAfterEnv(context);
    
    }
    
    static async clearDependencies() {
        loaded = false;
        Object.keys(dependencies).forEach((k) => {
            delete dependencies[k];
        })
    }
}

module.exports = {dependencies, DependencyManager};

