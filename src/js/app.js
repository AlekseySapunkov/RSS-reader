import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';

import resources from './locales/index';

import {
  loadRssHandler,
  postClickHandler,
  updateRss,
} from './controller';

import {
  renderErrors,
  renderModal,
  renderPosts,
  renderFeeds,
  renderForm,
  disableForm,
} from './view';

const app = () => {
  const state = {
    rssLinks: [],
    feeds: [],
    posts: [],
    errorValue: '',
    status: 'filling',
    isDisabled: false,
    ui: {
      clickedLink: null,
      viewedPostLinks: new Set(),
    },
  };

  const inputField = document.querySelector('#url-input');
  const feedBackField = document.querySelector('.feedback');
  const form = document.querySelector('.rss-form');
  const fieldset = form.querySelector('fieldset');
  const postsContainer = document.querySelector('.posts');
  const feedsContainer = document.querySelector('.feeds');

  const elements = {
    form,
    inputField,
    feedBackField,
    fieldset,
    postsContainer,
    feedsContainer,
  };

  const i18Instance = i18next.createInstance();

  i18Instance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'notValidUrlFormat',
      },
      mixed: {
        notOneOf: 'rssRepeat',
      },
    });

    const watchedState = onChange(state, (path, value) => {
      switch (path) {
        case 'feeds': {
          renderFeeds(state, elements, i18Instance);
          break;
        }
        case 'posts': {
          renderPosts(state, elements, i18Instance);
          break;
        }
        case 'isDisabled': {
          disableForm(state, elements);
          break;
        }
        case 'status':
          renderForm(
            state,
            elements,
            i18Instance,
          );
          disableForm(state, elements);
          break;
        case 'errorValue':
          renderErrors(
            elements,
            i18Instance.t(value),
          );
          break;
        default:
          break;
      }
    });

    const watchedStateUi = onChange(state, (path) => {
      switch (path) {
        case 'ui.viewedPostLinks':
          renderPosts(state, elements, i18Instance);
          break;
        case 'ui.clickedLink':
          renderModal(state);
          break;
        default:
          break;
      }
    });

    form.addEventListener('submit', (e) => {
      loadRssHandler(e, watchedState);
    });

    postsContainer.addEventListener('click', (e) => {
      postClickHandler(e.target, watchedStateUi);
    });

    updateRss(watchedState, elements, i18Instance);
  });
};

export default app;