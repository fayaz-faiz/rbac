db.rolesCount.insert({ _id: "item_id", sequence_value: 0 })

function getValueForNextSequence(sequenceOfName) {
  var sequenceDoc = db.rolesCount.findAndModify({
    query: { _id: sequenceOfName },
    update: { $inc: { sequence_value: 1 } },
    new: true
  });
  return sequenceDoc.sequence_value;
}


db.roles.insert([
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName": "admin",
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName": "manager",
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName": "teamLead",
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName": "teamMember",
  },
])




db.permissionsCount.insert({ _id: "item_id", sequence_value: 0 })

function getValueForNextSequence(sequenceOfName) {
  var sequenceDoc = db.permissionsCount.findAndModify({
    query: { _id: sequenceOfName },
    update: { $inc: { sequence_value: 1 } },
    new: true
  });
  return sequenceDoc.sequence_value;
}


db.permissions.insert([{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "List All Users"
},
{

  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "List All Managers"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "List All TeamLeads"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "List All TeamMembers"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "List All products"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Add users"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Add managers"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Add team leads"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Add team members"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Add products"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Update user"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Update manager"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Update team lead"
},

{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Update team member"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "update product"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "Delete users"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "delete manager"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "delete team lead"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "delete team member"
},
{
  "_id": getValueForNextSequence("item_id"),
  "rolePermission": "delete products"
},

])


db.rolePermissionsCount.insert({ _id: "item_id", sequence_value: 0 })

function getValueForNextSequence(sequenceOfName) {
  var sequenceDoc = db.rolePermissionsCount.findAndModify({
    query: { _id: sequenceOfName },
    update: { $inc: { sequence_value: 1 } },
    new: true
  });
  return sequenceDoc.sequence_value;
}


db.rolepermissions.insert([
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName":"admin",
    "permissions": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName":"manager",
    "permissions": [1,2,3,4,5]
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName":"teamLead",
    "permissions": [1,2,3,4,5]
  },
  {
    "_id": getValueForNextSequence("item_id"),
    "roleName":"teamMember",
    "permissions": [1,2,3,4,5]
  }
])

db.managerCount.insert({ _id: "item_id", sequence_value: 0 })

