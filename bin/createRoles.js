const role = require('../authoIncrement')
console.log("role",role)
const main = async () => {
    try {
      const collectionName = "roleCount"
      const role1 = await role.createCounter(collectionName);
      console.log("------",role1)
       await role.createRoles
        process.exit(0);
    } catch (err) {
        process.exit(0);
    }
}
main();