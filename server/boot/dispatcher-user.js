const ROLES = 'ADMIN';

module.exports = async function (server, next) {
  const AppUser = server.models.AppUser;
  const Role = server.models.Role;
  const RoleMapping = server.models.RoleMapping;

  let userInstance, roleInstance;

  // Find or Create User
  async function createUser() {
    let data = {
      firstName: 'dispatcher',
      lastName: 'homedr',
      email: 'dispatcher@homedr.com',
      password: 'dispatcher@homedr'
    }

    let filter = {
      where: {
        email: data.email
      }
    }

    try {
      let [userObj, created] = await AppUser.findOrCreate(filter, data);
      userInstance = userObj;
    } catch (error) {
      console.error('ERROR > CREATING DISPATCHER > ', error);
      throw error;
    }
  };

  // Find Or Create Role
  async function createRole() {
    let data = {
      name: 'DISPATCHER'
    }

    let filter = {
      where: data
    }

    try {
      let [roleObj, created] = await Role.findOrCreate(filter, data);
      roleInstance = roleObj;
    } catch (error) {
      console.error('ERROR > CREATING ROLE > ', error);
      throw error;
    }
  };

  // Assign Role
  async function assignRole() {
    let data = {
      principalId: userInstance.id,
      roleId: roleInstance.id,
      principalType: RoleMapping.USER
    }

    let filter = {
      where: data
    }

    try {
      let [roleMapObj, created] = await RoleMapping.findOrCreate(filter, data);
    } catch (error) {
      console.error('ERROR > ASSIGNING ROLE > ', error);
      throw error;
    }
  };

  await createUser();
  await createRole();
  await assignRole();
  next();
};
