const {InvalidChatConfig} = require("../errors/errors");
const DEFAULT_PROMT = "Use the following pieces of context to answer the users question.\n" +
    "Take note of the sources and include them in the answer in the format: \"SOURCES: source1 source2\", use \"SOURCES\" in capital letters regardless of the number of sources.\n" +
    "If you don't know the answer, just say that \"I don't know\", don't try to make up an answer.\n" +
    "----------------\n" +
    "##CONTEXT##\n";

class ChatService {
    constructor(searchService, openiaClient, accountService, collectionService, chatStorageService) {
        this.searchSearvice = searchService;
        this.openiaClient = openiaClient;
        this.collectionService = collectionService;
        this.chatStorageService = chatStorageService;
    }
    
    async startChat({collectionId, message, documentId}) {
        const chatId = await this.accountService.getById(accountId)
    
        if(message === undefined) {
            throw new InvalidChatConfig({message: "message field it's required"})
        }
        const messages = [];
        const collection = await this.collectionService.getById(collectionId);
    
        const contents = await this.searchSearvice.getRelevantContent({documentId, input: messages[0].content, index: collection.documentsIndexName})
        let incontext = "";
        for(const content of contents.body.hits.hits) {
            incontext = `${incontext}\nCONTEXT: ${content._source.content}\nSOURCE: ${content._source.name}\n`
        }
        const promt = collection.basePrompt || DEFAULT_PROMT;
        const finalSystemPromt = promt.replaceAll("##CONTEXT##",incontext);
        messages.unshift({role: "system", content: finalSystemPromt});
        console.log(finalSystemPromt);
        
        messages.unshift({role:"user", content: message});
        
        const ret = await this.runChat(messages);
     
        return ret;
    }
    
    async runChat(messages) {
        const result = await this.openiaClient.createChatCompletion({
            model:"gpt-3.5-turbo",
            temperature: 0.3,
            messages
        });
    
        const ret = {
            message: result.data.choices[0].message,
            usage: result.data.usage
        };
    
        messages.unshift(ret.message);
        if(this.chatStorageService) {
            this.chatStorageService.appendMessages(chatId, messages)
        }
        return ret;
    
    }
    async continueChat({chatId, message}) {
        const messages = this.chatStorageService.retrieveMessages(chatId);
        if(!messages) {
            throw new InvalidChatConfig({message: "Chat conversation has expired"});
        }
        messages.unshift({role:"user", content: message});
        const ret = await this.runChat(messages);
        return ret;
    }
}

module.exports = ChatService;
