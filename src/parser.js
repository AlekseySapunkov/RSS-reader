import uniqueId from 'lodash/uniqueId';

export default (state, data, type, curFeedId) => {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(data.contents, 'text/xml');
    const items = document.querySelectorAll('item');
    if (type === 'new') {
      const chaTitle = document.querySelector('channel > title').textContent;
      const chaDescription = document.querySelector('channel > description').textContent;
      state.feeds.push({
        id: curFeedId, title: chaTitle, description: chaDescription,
      });

      items.forEach((item) => {
        const title = item.querySelector('title').textContent;
        const description = item.querySelector('description').textContent;
        const link = item.querySelector('link').textContent;
        const postId = uniqueId();
        state.posts.push({
          feedId: curFeedId, id: postId, title, description, link,
        });
      });
    }
    if (type === 'existing') {
      const existingPosts = state.posts.filter(({ feedId }) => feedId === curFeedId);
      const existingPostsTitles = existingPosts.map(({ title }) => title);
      const newPosts = Array.from(items).filter((item) => {
        const title = item.querySelector('title').textContent;
        return !existingPostsTitles.includes(title);
      });
      newPosts.forEach((post) => {
        const title = post.querySelector('title').textContent;
        const description = post.querySelector('description').textContent;
        const link = post.querySelector('link').textContent;
        const postId = uniqueId();
        state.trackingPosts.push({
          feedId: curFeedId, id: postId, title, description, link,
        });
        state.posts.push({
          feedId: curFeedId, id: postId, title, description, link,
        });
      });
    }
  } catch (err) {
    state.parsingErrors.push(err);
    throw new Error();
  }
};
