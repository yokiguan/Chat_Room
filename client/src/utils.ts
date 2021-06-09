export const locationParams = () => {
  let params: { [props: string]: string } = {};
  let info = window.location.search.slice(1);
  info.split("&").forEach((i) => {
    let [k, v] = i.split("=");
    params[k] = v;
  });
  return params;
};
