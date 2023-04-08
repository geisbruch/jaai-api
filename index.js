const {dependencies, DependencyManager} = require("./infrastructure/dependency_injection");

const start = async () => {
    await DependencyManager.init({env: process.env["NODE_ENV"] ||"dev"});
    
    dependencies.commands.start();
}

start();



