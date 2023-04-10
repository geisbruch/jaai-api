const _ = require("lodash");
class RouteUtils {
    
    static objectToCamelCase(o) {
        return this.doTransform(o, _.camelCase);
    }
    
    static objectToSnakeCase(o) {
        return this.doTransform(o, _.snakeCase);
    };
    
    static doTransform(originalObject, f) {
        const ret = {};
        const navigated = [];
        const toNavigate = [];
        Object.keys(originalObject).forEach((e) => {
           toNavigate.push({elemKey: e, root: originalObject, newRoot: ret});
        });
        while (toNavigate.length > 0) {
            const {elemKey, root, newRoot} = toNavigate.shift();
            const elem = root[elemKey];
            if(typeof (elem) === "object" && elem !== undefined && elem !== null) {
                //Avoid circular reference
                if(navigated.indexOf(elem) != -1) {
                    continue;
                } else {
                    navigated.push(elem);
                    const r = {}
                    newRoot[f(elemKey)] = r;
                    Object.keys(elem).forEach((e) => {
                        toNavigate.push({elemKey: e, root: elem, newRoot: r});
                    });
                }
            } else {
                newRoot[f(elemKey)] = elem;
            }
        }
        return ret;
    }
}


module.exports = RouteUtils;
