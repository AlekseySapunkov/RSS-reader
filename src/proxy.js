const proxy = 'https://allorigins.hexlet.app/get';
export default (url) => {
  const urlWithProxy = new URL(proxy);
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};
