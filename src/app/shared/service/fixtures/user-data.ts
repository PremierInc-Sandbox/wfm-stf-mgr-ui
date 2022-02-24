export function customUserData() {
  return[{
    userKey: 'user key',
  activeFlag: true,
  ldapUsername: 'ldapUsername',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  formattedName: 'formattedName',
  title: 'title',
  privileges: [{
    code: 'SM_USER_AUTHENTICATION',
    description: 'Staff Manager New User Authentication',
    privilegeKey: null,
    parentPrivilege: null,
     }],
  role: 'role',
  },
    {
      userKey: 'user key',
      activeFlag: true,
      ldapUsername: 'ldapUsername',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      formattedName: 'formattedName',
      title: 'title',
      privileges: [{
        code: 'SM_USER_AUTHENTICATION',
        description: 'Staff Manager New User Authentication',
        privilegeKey: null,
        parentPrivilege: null,
      }],
      role: undefined,
    }];

}


