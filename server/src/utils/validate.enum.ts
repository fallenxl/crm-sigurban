export const validateEnum = (enumType: any, value: string) => {
  if (!value) return false;
  return value in enumType;
};
