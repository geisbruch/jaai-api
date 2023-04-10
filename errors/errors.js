const ERROR_TYPES = {
    EntityNotFoundException: "EntityNotFoundException",
    InvalidDocument: "InvalidDocument",
    InvalidChatConfig: "InvalidChatConfig",
    InvalidDocumentConfig: "InvalidDocumentConfig"
    
}

class BaseError extends Error {
    constructor({message, error=undefined, name = "BaseError"}) {
        super(message);
        this.message = message;
        this.error = error;
        this.name = name;
    }
}


class EntityNotFoundException extends BaseError {
    constructor({message, error}) {
        super({message, error, name: ERROR_TYPES.EntityNotFoundException});
    }
    
}

class InvalidDocument extends BaseError {
    constructor({message, error}) {
        super({message, error, name: ERROR_TYPES.InvalidDocument});
    }
    
}

class InvalidChatConfig extends BaseError {
    constructor({message, error}) {
        super({message, error, name: ERROR_TYPES.InvalidChatConfig});
    }
}

class InvalidDocumentConfig extends BaseError {
    constructor({message, error}) {
        super({message, error, name: ERROR_TYPES.InvalidDocumentConfig});
    }
}
module.exports={BaseError, EntityNotFoundException, InvalidDocument, InvalidChatConfig, InvalidDocumentConfig, ERROR_TYPES};
