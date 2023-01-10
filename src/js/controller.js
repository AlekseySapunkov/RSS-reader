import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import parserXML from './parser';

const validateRss = (state, url) => {
  const rssValidateSchema = yup.object().shape({
    link: yup.string().url().notOneOf(state.rssLinks),
  });

  return rssValidateSchema.validate(url);
};

const downloadRss = (rssUrl) => {
  const rssLink = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rssUrl)}`;
  return axios
    .get(rssLink)
    .then((response) => response.data.contents);
};

const errorHandler = (state, error) => {
  switch (error.name) {
    case 'AxiosError': {
      state.errorValue = 'errors.networkProblems';
      break;
    }
    case 'TypeError': {
      state.errorValue = 'errors.notHaveValidRss';
      break;
    }
    case 'ValidationError': {
      state.errorValue = `errors.${error.message}`;
      break;
    }
    default:
      state.errorValue = 'errors.unknown';
  }
};

const loadRssHandler = (event, state) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  const link = formData.get('url').trim();

  state.isDisabled = true;

  validateRss(state, { link })
    .then(() => {
      state.status = 'processing';
      return downloadRss(link);
    })
    .then((response) => {
      const id = _.uniqueId();
      const { feed, posts } = parserXML(response, link);
      feed.id = id;
      posts.forEach((post) => {
        state.posts.push({ id, post });
      });

      state.feeds.push(feed);
      state.rssLinks.unshift(feed.rssLink);
      state.isDisabled = false;
      state.status = 'processed';
    })
    .catch((error) => {
      state.isDisabled = false;
      state.status = 'processingErrors';
      errorHandler(state, error);
    });
};

const markAsVisited = (element, watchedState) => {
  const { href } = element;
  watchedState.ui.viewedPostLinks.add(href);
};

const postClickHandler = (element, watchedState) => {
  switch (element.tagName) {
    case 'A': {
      markAsVisited(element, watchedState);
      break;
    }
    case 'BUTTON': {
      const a = element.parentNode.querySelector('a');
      markAsVisited(a, watchedState);
      watchedState.ui.clickedLink = a.href;
      break;
    }
    default:
      throw new Error('unexpected tagname in handlePostClick controller');
  }
};

const updateRss = (state, elements, i18n) => {
  const promises = state.feeds.map(({ id, rssLink }) => downloadRss(rssLink).then((response) => {
    const { posts } = parserXML(response, rssLink);

    const oldPosts = state.posts.filter((post) => post.id === id).map(({ post }) => post);

    const difference = _.differenceBy(posts, oldPosts, 'postLink');

    const [temp] = [...difference];

    if (difference.length) state.posts.unshift({ id, post: temp });
  }).catch((error) => { state.errorValue = error.name; }));
  Promise.all(promises).then(() => setTimeout(() => updateRss(state, elements, i18n), 5000));
};

export {
  loadRssHandler,
  postClickHandler,
  updateRss,
};