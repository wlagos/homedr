const ROLES = 'ADMIN';

module.exports = async function (server, next) {
  const AppUser = server.models.AppUser;
  const Role = server.models.Role;
  const RoleMapping = server.models.RoleMapping;

  // Admin user data
  let data = {
    firstName: 'admin',
    lastName: 'homedr',
    email: 'admin@homedr.com',
    password: 'admin@homedr',
    state: 'AR'
  }

  // Filter for unique
  let filter = {
    where: {
      email: 'admin@homedr.com'
    }
  }

  // Filter to get role
  let roleFilter = {
    where: {
      name: 'ADMIN'
    }
  }

  try {
    let [userInstance, created] = await AppUser.findOrCreate(filter, data);

    let roleInstance = await Role.findOne(roleFilter);

    let mapping = {
      principalId: userInstance.id,
      principalType: RoleMapping.USER
    }

    let mappingFilter = {
      roleId: roleInstance.id,
      principalId: userInstance.id,
      principalType: RoleMapping.USER
    }

    let isRoleAssigned = await RoleMapping.count(mappingFilter);

    if(isRoleAssigned) {
      return next();
    }
    
    let roleAssigned = await roleInstance.principals.create(mapping);
    return next();
  } catch(error) {
    console.error('ERROR > ', error);
    return next();    
  }
};
