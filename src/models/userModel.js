export function createUserModel({
  name,
  email,
  passwordHash,
  permissions = {},
}) {
  return {
    id: null,
    name,
    email,
    passwordHash,
    isDisabled: false,
    permissions: {
      canCreateBook: false,
      canUpdateBook: false,
      canDeleteBook: false,
      canUpdateUser: false,
      canDeleteUser: false,
      canReadUsers: false,
      ...permissions,
    },
  };
}
