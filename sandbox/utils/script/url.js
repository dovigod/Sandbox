export function resolveQueryString(queryParam) {
  const paramList = [];
  let queryString = "";
  if (queryParam) {
    Object.keys(queryParam).forEach((queryKey) => {
      paramList.push(`${queryKey}=${queryParam[queryKey]}`);
    });
  }
  if (paramList.length > 0) {
    queryString = paramList.join("&");
    queryString = `?${queryString}`;
  }
  return queryString;
}
