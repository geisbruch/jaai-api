var express = require('express');
const RouterUtils = require("./route_utils");
const bodyParser = require('body-parser')
const _ = require("lodash");
class Router {
    constructor({routers = []} = {}) {
        this.app = express();
        this.routers = routers;
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.text({ inflate: true, limit: '20480kb', type: 'text/plain' }))
        this.app.use(bodyParser.raw({ inflate: true, limit: '20480kb', type: 'application/pdf' }));
    
        this.app.use(bodyParser.urlencoded({ extended: false }))
        // Cammel/Cnake case
        this.app.use((req, res, next) => {
           if(req.body !== undefined && typeof(req.body) === "object") {
               req.body = RouterUtils.objectToCamelCase(req.body);
           }
           const originalSend = res.send;
           res.send = (o) => {
                let objToSend = o;
                if(o !== undefined && typeof (o) === "object") {
                    objToSend = RouterUtils.objectToSnakeCase(o);
                }
                return originalSend.call(res,objToSend);
            }
           next();
        });
        this.routers = routers;
    }
    
    async configure() {
        for (const r of this.routers) {
            await r.configure(this.app);
        }
    }
    
    getApp() {
        return this.app;
    }
}

module.exports = Router;
