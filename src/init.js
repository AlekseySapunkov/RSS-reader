import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import { object, string } from 'yup';
import uniqueId from 'lodash/uniqueId';
import languages from './locales/index.js';
import render from './render.js';
import parser from './parser.js';


const handleErrors = (error) => {
  switch (error.message) {
    case 'Network Error':
      return 'network';
    case 'Parsing Error':
      return 'invalidRSS';
    default:
      return 'defaultError';
  }
};

export default async () => {
  const addProxy = (url) => {
    const proxy = 'https://allorigins.hexlet.app/get';
    const urlWithProxy = new URL(proxy);
    urlWithProxy.searchParams.set('url', url);
    urlWithProxy.searchParams.set('disableCache', 'true');
    return urlWithProxy.toString();
  };
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources: languages,
  });
  const state = {
    feeds: [],
    posts: [],
    newFeedId: '',
    error: '',
    addedUrls: [],
    trackingPosts: [],
    viewedPost: '',
    formValidation: {
      state: 'valid',
      error: null,
    },
    uiState: {
      seenPosts: new Set(),
    },
    dataLoading: {
      state: 'waiting',
      error: null,
    },
  };
  const form = document.querySelector('form.rss-form');
  const posts = document.querySelector('.posts')
  const watch = onChange(state, render(state, form, i18nInstance));
  const loadPosts = (userUrl) => {
    watch.dataLoading.state = 'processing';
    const url = addProxy(userUrl);
    axios
      .get(url)
      .then((response) => {
        const XML = response.data.contents;
        const feed = parser(XML);
        watch.feeds.push({ ...feed, url: userUrl });
        const messages = feed.posts.map((post) => ({
          ...post,
          postId: uniqueId(),
        }));
        watch.posts.push(...messages);
        watch.dataLoading.state = 'successful';
        watch.dataLoading.state = 'waiting';
      })
      .catch((error) => {
        watch.dataLoading.error = handleErrors(error);
        watch.dataLoading.state = 'failed';
        console.error(error);
        watch.dataLoading.state = 'waiting';
      });
  };

  const validateForm = (states, url) => {
    const previousURLs = states.feeds.map((feed) => feed.url);
    const schema = object({
      url: string().url().required().notOneOf(previousURLs),
    });
    return schema.validate({ url });
  };
  const updateFeed = () => {
    const feeds = watch.feeds.map((feed) => {
      const url = addProxy(feed.url);
      return axios
        .get(url)
        .then((response) => {
          const XML = response.data.contents;
          const updatedFeed = parser(XML);
          const newPosts = updatedFeed.posts.filter(
            (post) =>
              !watch.posts.map((el) => el.link).includes(post.link)
          );
          if (newPosts.length > 0) {
            watch.posts.push(
              ...newPosts.map((post) => ({ ...post, postId: uniqueId() }))
            );
            watch.uiState.state = 'updatingFeed';
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
    const delay = 5000;
    Promise.all(feeds).finally(setTimeout(updateFeed, delay, state));
  };
  updateFeed();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    validateForm(state, url)
      .then(() => {
        watch.formValidation.state = 'valid';
        loadPosts(url, state);
      })
      .catch((error) => {
        watch.formValidation.error = error.message;
        watch.formValidation.state = 'invalid';
        watch.state.error = error;
      });
  });

  posts.addEventListener(
    'click',
    (e) => {
      const postButton = e.target;
      const targetPost = watch.posts.find(
        ({ id }) => id === postButton
      );

      watch.UIState.shownPosts.push({ postButton: targetPost.id });
    },
    true
  );
};
