const {DataTypes} = require("@sequelize/core");
const {Model} = require("@sequelize/core");



const DocumentStatus = {
    CREATED: "CREATED",
    INDEXED: "INDEXED",
    ERROR: "ERROR",
    DELETED: "DELETED"
}

class Document extends Model {
}

function defineModel(seq) {
    Document.init({
        id:{
            field: "id",
            type: DataTypes.STRING(256),
            primaryKey: true
        },
        status: {
            field: "status",
            type: DataTypes.ENUM(...Object.values(DocumentStatus)),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            }
        },
        documentUrl: {
            field: "id",
            type: DataTypes.STRING(1024)
        },
        name: {
            field: "name",
            type: DataTypes.STRING(1024)
        },
        priority: {
            field: "priority",
            type: DataTypes.INTEGER
        },
        collectionId: {
            field: "collection_id",
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            }
        }
    }, {
        sequelize: seq,
        modelName: "document",
        freezeTableName: true,
        indexes: [
            {
                unique: false,
                fields: ["collection_id"]
            }, {
                unique: false,
                fields: ["collection_id", "name"]
            },
        ],
        underscored: true
    });
    
    return Document
}

module.exports = {defineModel, DocumentStatus}
