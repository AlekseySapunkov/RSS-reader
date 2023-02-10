const mapPosts = (posts) => posts
  .map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent.trim();
    return { title, link, description };
  });

const parse = (data) => {
  const rssParser = new DOMParser();
  const document = rssParser.parseFromString(data, 'text/xml');
  const errorNode = document.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Parsing Error');
  }

  const channel = document.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;

  const postItems = channel.querySelectorAll('item');
  const posts = mapPosts(Array.from(postItems));

  return { title, description, posts };
};

export default parse;
