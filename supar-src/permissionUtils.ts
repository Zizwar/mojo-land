export const isAuthorized = (
    dbData: any,
    user: { roles?: { role: { name: string } }[] }
  ) => {
    if (!dbData.method) return null;
    const permission = dbData?.permissions ? dbData.permissions[dbData.method] : null;
  
    if (!permission) return null;
    if (permission === "public") return true;
  
    const extractColumnsRoles = permission.split(",").map((role: string) => role.trim());
    const found = user.roles?.some((roleObj) =>
      extractColumnsRoles.includes(roleObj?.role.name)
    );
  
    return found;
  };