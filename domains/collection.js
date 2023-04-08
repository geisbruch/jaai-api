const {DataTypes} = require("@sequelize/core");
const {Model} = require("@sequelize/core");



const CollectionStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
}

class Collection extends Model {
}

function defineModel(seq) {
    Collection.init({
        id:{
            field: "id",
            type: DataTypes.STRING(256),
            primaryKey: true
        },
        status: {
            field: "status",
            type: DataTypes.ENUM(...Object.values(CollectionStatus)),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            }
        },
        name: {
            field: "name",
            type: DataTypes.STRING(1024)
        },
        accountId: {
            field: "account_id",
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            }
        },
        documentsIndexName: {
            field: "documents_index_name",
            type: DataTypes.STRING(1024)
        },
        documentsBasePath: {
            field: "documents_base_path",
            type: DataTypes.STRING(1024)
        },
        basePrompt: {
            field: "base_promt",
            type: DataTypes.STRING(4048)
        },
    }, {
        sequelize: seq,
        modelName: "collection",
        freezeTableName: true,
        indexes: [
            {
                unique: false,
                fields: ["account_id"]
            },
            {
                unique: true,
                fields: ["account_id","name"]
            }
        ],
        underscored: true
    });
    
    return Collection;
}

module.exports = {defineModel, CollectionStatus}
