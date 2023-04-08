const DomainUtils = require("../domains/domain_utils");
const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");

class SearchService {
    constructor(client, openiaClient) {
        this.client = client;
        this.openiaClient = openiaClient;
    }
    
    async createIndex(indexName) {
        const settings = {
            settings: {
                index: {
                    number_of_shards: 4,
                    number_of_replicas: 3,
                    "knn": true,
                    "knn.algo_param.ef_search": 100
                },
            },
            mappings:{
                properties: {
                    documentId: {"type": "text", "index": true},
                    accountId: {"type": "text", "index": true},
                    priority: {"type": "integer", "index": true},
                    name: {"type": "text", "index": true},
                    content: {"type": "text", "index": true},
                    embedding: {"type": "knn_vector", "dimension": 1536,  "method": {
                            name: "hnsw",
                            space_type: "l2",
                            engine: "faiss",
                            parameters: {
                            ef_construction: 128,
                            m: 24
                        }
                    },"index": true}
                
                }
            }
        };
    
        var response = await this.client.indices.create({
            index: indexName,
            body: settings,
        });
    }
    
    async indexDocument({index, document, accountId}) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500, //max size(chars) of docs chunk
            chunkOverlap: 100, //how much overlap betwen chunks
        });
        const output = await splitter.createDocuments([document.content]);
        for(const doc of output) {
            const data = doc.pageContent;
            const embedding = await this.createEmbedding({input: data});
            this.client.index({
                id:  DomainUtils.generateId(),
                index,
                body: {
                    content: data,
                    embedding,
                    priority: document.priority,
                    documentId: document.id,
                    accountId,
                    name: document.name,
                }
            })
        }
    }
    
    async createEmbedding({input}) {
        const embedding = await this.openiaClient.createEmbedding({
            model: "text-embedding-ada-002",
            input
        });
        return embedding["data"]["data"][0]["embedding"];
    }
    
    async getRelevantContent({input, index, documentId}) {
        let body;
        if(documentId !== undefined) {
            body = {
                from:0,
                size: 3,
                query: {
                    bool: {
                            should: [
                                {
                                    match: {
                                        "documentId": documentId
                                    }
                                }
                            ]
                        }
                    }
            }
        } else {
            const embedding = await this.createEmbedding({input});
    
            body = {
                query: {
                    size: 3,
                    query: {
                        knn: {
                            embedding: {
                                vector: embedding,
                                k: 9
                            }
                        }
                    }
                }
            }
        }
        return await this.client.search({
            index,
            body
        })
    }
}

module.exports = SearchService;
