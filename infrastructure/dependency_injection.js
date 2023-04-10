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
const ChatRouter = require("../routes/chat_router");

// Processors
const JsonProcessor = require("../routes/document_processors/json_processor");
const TextFileProcessor = require("../routes/document_processors/text_file_processor");
const PDFProcessor = require("../routes/document_processors/pdf_processor");


// Services definitions
const {AccountService} = require("../services/account_service");
const {CollectionService} = require("../services/collection_service");
const SearchService = require("../services/search_service");
const {DocumentService} = require("../services/document_service");
const ChatService = require("../services/chat_service");
const InMemoryChatStorageService = require("../services/in_memory_chat_storage_service");
const dependencies = {}
let loaded = false;
class DependencyManager {
    
    static async loadCommons(context) {
        dependencies["domains"] = {};
        dependencies["commands"] = {};
        dependencies["services"] = {};
    }
    
    static async loadTest(context) {
        const sequelize = new Sequelize(`postgres://${process.env["DB_USERNAME"]}:${process.env["DB_PASSWORD"]}@${process.env["DB_HOSTNAME"]}:${process.env["DB_PORT"]}/${process.env["DB_NAME"]}`,{
            logging: console.log,
            schema: process.env["DB_SCHEMA"]
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
            node: `${process.env["OPENSEARCH_HOST"]}`
        })
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
            apiKey: process.env.OPENAI_API_KEY  ,
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
    
        if(context.env === "test") {
            for(const domain of Object.keys(dependencies.domains)) {
                await dependencies.domains[domain].sync();
            }
        }
        
        const accountService = new AccountService(dependencies.domains.Account, "s3://demo-bucket");
        const searchService = new SearchService(dependencies.opensearchClient, dependencies.openiaClient);
        const collectionService = new CollectionService(dependencies.domains.Collection, accountService, searchService);
        const documentService = new DocumentService(dependencies.domains.Document, collectionService, accountService, searchService);
        
        const inMemoryChatStorageService = new InMemoryChatStorageService();
        const chatService = new ChatService(searchService, dependencies.openiaClient, accountService, collectionService, inMemoryChatStorageService);
        dependencies.services = {
            accountService, searchService, collectionService, documentService, chatService
        }
        
        const processors = {
            "application/json": new JsonProcessor(),
            "text/plain": new TextFileProcessor(),
            "application/pdf": new PDFProcessor()
        };
        
        const accountRouter = new AccountRouter(accountService);
        const collectionRouter = new CollectionRouter(collectionService);
        const documentRouter = new DocumentRouter(documentService, processors)
        const chatRouter = new ChatRouter(chatService)
    
        dependencies.router = new Router({routers:[accountRouter, collectionRouter, documentRouter, chatRouter]});
        await dependencies.router.configure();
    
    }
    
    static async init(context = {env:"dev"}) {
        const {env} = context;
        await this.loadCommons(context);
        if(["dev"].indexOf(env.toLowerCase()) > -1) {
            await this.loadDev(context);
        }else if(["test"].indexOf(env.toLowerCase()) > -1) {
            await this.loadTest(context);
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

