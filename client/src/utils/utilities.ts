export const hasEmptyProperties = (obj: any) => {
  for (const key in obj) {
    if (obj[key] === "") return true;
  }
  return false;
};

export const hasEmptyPropertiesExcept = (obj: any, except: string[]) => {
  for (const key in obj) {
    if (obj[key] === "" && !except.includes(key)) return true;
  }
  return false;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase();
};

export const capitalizeFirstLetterByWord = (string: string) => {
  return string.split(" ").map(capitalizeFirstLetter).join(" ");
};

export const clearDNIMask = (dni: string) => {
  return dni.replace(/\D/g, "");
};

export function paginateArray<T>(
  array: T[],
  itemsPerPage: number,
  currentPage: number
): {
  paginatedItems: T[];
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = array.slice(startIndex, endIndex);

  const totalPages = Math.ceil(array.length / itemsPerPage);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return { paginatedItems, totalPages, hasNext, hasPrevious };
}

export function isArrayOfStrings(arr: any | null): arr is string[] {
  if (!arr) return false;
  return arr.every((item: any) => typeof item === "string");
}