const ROLES = ['ADMIN', 'DISPATCHER', 'PROVIDER', 'PATIENT'];

module.exports = async function (server, next) {
  var Role = server.models.Role;

  async function createRole(role) {
    let filter = {
      where: {
        name: role
      }
    }
    let data = {
      name: role
    }
    try {
      let resp = await Role.findOrCreate(filter, data);
      return resp;
    } catch (error) {
      console.error('ERROR > ', error);
    }
  }

  async function createRoles() {
    for (let role of ROLES) {
      let [roleInstance, created] = await createRole(role);
      console.log('Role > ', roleInstance.name);
      console.log('Created > ', created);
    };
  }

  await createRoles();
};
