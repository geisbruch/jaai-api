# JaaI API

This API is intended to enable you to create a scalable 'Chat GPT' for your own data.

There is a lot on the internet about how you can create your own GPT or how you can use GPT with your data. If you want to do it on your own, I strongly recommend that you check https://github.com/hwchase17/langchain.

However, **if you just want to test the technology or are looking for something to start playing with your own data with Chat GPT in seconds, I strongly recommend that you keep reading.**


## Installation

To start the idea it's to do it as simple as possible, you just only need 
- docker
- docker-compose installed, 
- an open ai api key (if you don't know hot to get it check https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key )

then you need to run

```bash
git clone https://github.com/geisbruch/jaai-api
cd jaai-api
export OPENAI_API_KEY=<here your key>
docker-compose up
```

It will take a while ...
After it has started (It will create a local opensearch server, a local PostgresSql and the api server)

## Usage
by now json and text document (any text document) are supported

Here some examples about how to usage 

### First create an "account"

```
curl -X POST 127.0.0.1:3000/account -d '{"name":"test"}' -H"Content-Type: application/json"

Example response:
{"id":"df0011cc4e104aeb85c7a1eaa98c02d2","status":"ACTIVE","name":"test","suspended_message":null,"documents_repository_url":"s3://demo-bucket/df0011cc4e104aeb85c7a1eaa98c02d2"}
```

### Now index a document

Node: your documents will be created into collections, a collection is the "search unit" you can create add-hoc chat gpt query's
using either a collection or a document

```
ACCOUNT_ID=df0011cc4e104aeb85c7a1eaa98c02d2
curl -XPOST 127.0.0.1:3000/document -H"X-Account-Id: $ACCOUNT_ID" -H"X-Collection-Name: test" -H"X-Document-Name: test1" -H"Content-Type: text/plain" --data-binary "@$PWD/errors/errors.js" 

example response
{"id":"d1d1f09bf4984083a52f2a11ca52a0a9","status":"CREATED","name":"test1","collection_id":"4d3b9d5feeae4bfb993b64d78902eb89"}
```

Here we have indexed the errors of this API

If you want to index json documents

```
curl -XPOST 127.0.0.1:3000/document -d  "{\"account_id\":\"$ACCOUNT_ID\", \"collection_name\":\"test\", \"document\":{\"name\":\"doc 1\",\"content\":\"THE CONTENT GOES HERE\"}}"
```

### So we will query it

To do that we will ``start a chat``

```
ACCOUNT_ID=df0011cc4e104aeb85c7a1eaa98c02d2
COLLECTION_ID=7e3f4c7459e646a7babbf6e95e502ab3
curl -X POST -H"Content-Type: application/json" -d "{\"collection_id\":\"$COLLECTION_ID\", \"message\":\"can you tell me what errors have I defined ?\"}" http://127.0.0.1:3000/chat
```

And here the magic happens and you should get something like it
```
{"message":{"role":"assistant","content":"Yes, the defined errors are: EntityNotFoundException, InvalidDocument,
 InvalidChatConfig, and InvalidDocumentConfig. They are defined in the `ERROR_TYPES` object."},
 "usage":{"prompt_tokens":610,"completion_tokens":33,"total_tokens":643},
 "chat_id":"e81f5c9d9a0248b99e19de311cb7cdad"}(
```

You can also set an specific document you want to use instead of the whole collection

```
ACCOUNT_ID=df0011cc4e104aeb85c7a1eaa98c02d2
COLLECTION_ID=7e3f4c7459e646a7babbf6e95e502ab3
DOCUMENT_ID=a22d3e0cf8c24282b7ab7fc3f4049dcd
curl -X POST -H"Content-Type: application/json" -d "{\"collection_id\":\"$COLLECTION_ID\", \"document_id\":\"$DOCUMENT_ID\", \"message\":\"can you tell me what errors have I defined ?\"}" http://127.0.0.1:3000/chat

#Similar example answer
{"message":{"role":"assistant","content":"Yes, the defined errors are: EntityNotFoundException, InvalidDocument,
 InvalidChatConfig, and InvalidDocumentConfig. They are defined in the `ERROR_TYPES` object."},
 "usage":{"prompt_tokens":610,"completion_tokens":33,"total_tokens":643},
 "chat_id":"e81f5c9d9a0248b99e19de311cb7cdad"}(
```

If you want you can follow the conversation over the same context to do that (by now chat memory is in the api instance memory)

```
CHAT_ID=0496e6728fbf493da7a53428866c59e9
curl -X POST -H"Content-Type: application/json" -d "{\"message\":\"can you show me a usage example of those errors ?\"}" http://127.0.0.1:3000/chat/$CHAT_ID

#Another magic anwer from chat gpt

{
    "message": {
        "role": "assistant",
        "content": "Sure! Here's an example of how you could use the EntityNotFoundException error:\n\n```\n
        function findEntityById(id) {\n  
            const entity = someDatabase.find(entity => entity.id === id);\n  
            if (!entity) {\n
                  throw new EntityNotFoundException({ message: `Entity with id ${id} not found` });\n        
            }\n         
            return entity;\n     
        }\n```\n\n
        In this example, we're trying to find an entity in a database by its ID. If the entity is not found, we throw an EntityNotFoundException error with a message indicating which ID was not found."
    },
    "usage": {
        "prompt_tokens": 663,
        "completion_tokens": 114,
        "total_tokens": 777
    },
    "chat_id": "0496e6728fbf493da7a53428866c59e9"
}


```

## How it works?

There is a lot of information about it on the net, but the basic workflow is:

### Ingestion

- You send a document.
- That document is split into smaller chunks (about 1500 words) because the prompt has some small limits.
- An embedding of each chunk is calculated. An embedding is a numerical representation of your text (https://platform.openai.com/docs/guides/embeddings).
- Your embedding, joined to the document, is stored and indexed (in our case, it is OpenSearch. In the future, we'll also store the full document in some other storage).

### Query

- You enter a message.
- The embedding of your message is calculated.
- Using the embedding, the most relevant contents are searched (by now, in OpenSearch).
- A full prompt is created, including:
    - A system prompt, which tells Chat GPT how to act.
    - A context, all the relevant documents found using the embeddings of your query and your documents.
    - Your message.
- The full prompt is sent to the OpenAI API.
- The answer is stored locally to enable you to *follow* the conversation.

## Promt engineering

A very important part of it is the prompt you use for the context. By default, there is a prompt in services/chat_services.js, but if you want, you can choose one per collection using the prompt field.

## Next Steps

- Support PDFs
- Suport Audio
- Support images
- Testing (yes it has been started just as a discovery but now we should add som testing)
- Offer it as SaaS

