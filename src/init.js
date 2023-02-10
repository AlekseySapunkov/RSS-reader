import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { object, string } from 'yup';
import uniqueId from 'lodash/uniqueId';
import languages from './locales/index.js';
import render from './render.js';
import parser from './parser.js';
import addProxy from './proxy.js';
import handleErrors from './handleErrors.js';

export default async () => {
  const elements = {
    urlForm: document.querySelector('form'),
    feedsArea: document.querySelector('.feeds'),
    feedsList: document.querySelector('.feed-list'),
    postsArea: document.querySelector('.posts'),
    postsList: document.querySelector('.post-list'),
    button: document.querySelector('[aria-label="add"]'),
    input: document.querySelector('input'),
    column: document.querySelector('.col-md-10'),
    feedback: document.createElement('p'),
  };

  const validateForm = (state, url) => {
    const previousURLs = state.feeds.map((feed) => feed.url);
    const schema = object({
      url: string().url().required().notOneOf(previousURLs),
    });
    return schema.validate({ url });
  };

  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: 'ru',
      debug: true,
      resources:
        languages,
    })
    .then(() => {
      const state = {
        formValidation: {
          state: 'waiting',
          error: null,
        },
        dataLoading: {
          state: 'waiting',
          error: null,
        },
        viewedPost: new Set(),
        uiState: {
          state: '',
        },
        feeds: [],
        posts: [],
      };

      const watchedState = onChange(state, (path) => {
        render(state, path, i18n, elements);
      });

      const loadPosts = (userUrl) => {
        watchedState.dataLoading.state = 'processing';
        const url = addProxy(userUrl);
        axios
          .get(url)
          .then((response) => {
            const xml = response.data.contents;
            const feed = parser(xml);
            watchedState.feeds.push({ ...feed, url: userUrl });
            const posts = feed.posts.map((post) => ({
              ...post,
              postId: uniqueId(),
            }));
            watchedState.posts.push(...posts);
            watchedState.dataLoading.state = 'successful';
            watchedState.dataLoading.state = 'waiting';
          })
          .catch((error) => {
            watchedState.dataLoading.error = handleErrors(error);
            watchedState.dataLoading.state = 'failed';
            console.error(error);
            watchedState.dataLoading.state = 'waiting';
          });
      };

      const updateFeed = () => {
        const feeds = watchedState.feeds.map((feed) => {
          const url = addProxy(feed.url);
          return axios
            .get(url)
            .then((response) => {
              const xml = response.data.contents;
              const updatedFeed = parser(xml);
              const newPosts = updatedFeed.posts
                .filter((post) => !watchedState.posts.map((el) => el.link).includes(post.link));
              if (newPosts.length > 0) {
                watchedState.posts
                  .push(...newPosts.map((post) => ({ ...post, postId: uniqueId() })));
                watchedState.uiState.state = 'updatingFeed';
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

      elements.urlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const url = data.get('url');
        validateForm(state, url)
          .then(() => {
            watchedState.formValidation.state = 'valid';
            loadPosts(url, state);
          })
          .catch((error) => {
            watchedState.formValidation.error = error.message;
            watchedState.formValidation.state = 'invalid';
            console.error(error);
          });
      });
      elements.postsArea.addEventListener('click', (e) => {
        const postButton = e.target.getAttribute('data-bs-postid');
        watchedState.viewedPost.add(postButton);
      }, true);
    });
};
