const {dependencies, DependencyManager} = require("../../infrastructure/dependency_injection");

const doc = "node-simple-lru-cache\n" +
    "=====================\n" +
    "\n" +
    "[![Build Status](https://travis-ci.org/geisbruch/node-simple-lru-cache.svg?branch=master)](https://travis-ci.org/geisbruch/node-simple-lru-cache)\n" +
    "\n" +
    "It's a very simple and extremely fast lru cache for node.js.\n" +
    "\n" +
    "This cache will priorize the lastest used keys over the least used keys, \n" +
    "so when a new key is added if the cache is full, the least used key will be removed\n" +
    "\n" +
    "## Instalation\n" +
    "    \n" +
    "    npm install simple-lru-cache\n" +
    "\n" +
    "## Usage\n" +
    "    var SimpleCache = require(\"simple-lru-cache\")\n" +
    "\n" +
    "    var cache = new SimpleCache({\"maxSize\":1000})\n" +
    "\n" +
    "    //Add an Objet\n" +
    "    cache.set(\"hello\",\"world\")\n" +
    "\n" +
    "    //Get an Object\n" +
    "    cache.get(\"hello\")\n" +
    "\n" +
    "    //Delete an Object\n" +
    "    cache.del(\"hello\")\n" +
    "\n" +
    "    //Reset cache\n" +
    "    cache.reset()\n" +
    "\n" +
    "## Tests\n" +
    "    \n" +
    "    npm install\n" +
    "    npm test\n" +
    "\n" +
    "## Benchmark against lru-cache\n" +
    "\n" +
    "      make bench\n"

jest.setTimeout(6000000);
describe("test",  () => {
   
    it("should index and query a document", async () => {
        await DependencyManager.init({env: "test"});
        const account = await dependencies.services.accountService.create({name: "test"});
        const document = await dependencies.services.documentService.create({accountId: account.id, collectionName:"test",document : {
            name: "test",
            content: doc
        }});
        const chat = await dependencies.services.chatService.startChat({documentId: document.id,accountId: account.id, collectionId:document.collectionId,
            message: "can you explain me how to initialize and get data from cache using simple lru library, I would like a max size of 75 elements?"})
        
        console.log(chat)
    });
});
