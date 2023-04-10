const {DataTypes} = require("@sequelize/core");
const {Model} = require("@sequelize/core");



const AccountStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    SUSPENDED: "SUSPENDED"
}

class Account extends Model {
}

function defineModel(seq) {
    Account.init({
        id:{
            field: "account_id",
            type: DataTypes.STRING(256),
            primaryKey: true
        },
        status: {
            field: "account_status",
            type: DataTypes.ENUM(...Object.values(AccountStatus)),
            allowNull: false,
            validate: {
                notNull: true,
                notEmpty: true,
            }
        },
        name: {
            field: "account_name",
            type: DataTypes.STRING(1024)
        },
        suspendedMessage: {
            field: "suspended_message",
            type: DataTypes.STRING,
        },
        documentsRepositoryUrl: {
            field: "documents_repository_url",
            type: DataTypes.STRING(1024)
        },
    }, {
        sequelize: seq,
        modelName: "account",
        freezeTableName: true,
        indexes: [
        ],
        underscored: true
    });
    
    return Account
}

module.exports = {defineModel, AccountStatus}
