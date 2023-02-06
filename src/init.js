import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import languages from './locales/index.js';
import render from './render.js';
import parser from './parser.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources: languages,
  });

  const state = {
    fields: {
      url: '',
    },
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
    dataLoading: {
      state: 'waiting',
      error: null,
    },
  };
  const form = document.querySelector('form.rss-form');
  const watch = onChange(state, render(state, form, i18nInstance));
  const tracking = (states, url, instance, feedId) => {
    const modifiedUrl = `${instance.t('proxy')}${encodeURIComponent(url)}`;
    const iter = () => {
      axios.get(modifiedUrl)
        .then((response) => parser(states, response.data, 'existing', feedId))
        .catch((err) => console.error(err))
        .then(() => setTimeout(() => iter(), 5000));
    };
    setTimeout(() => iter(), 5000);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.fields.url = url;

    yup.setLocale({
      mixed: {
        notOneOf: i18nInstance.t('errors.addedRss'),
        default: 'field_invalid',
      },
      string: {
        url: i18nInstance.t('errors.invalidUrl'),
      },
    });
    const schema = yup.object().shape({
      url: yup.string().url().nullable().notOneOf(state.addedUrls),
    });
    schema.validate(state.fields)
      .then(() => {
        watch.formValidation.state = 'valid';
        const modifiedUrl = `${i18nInstance.t('proxy')}${encodeURIComponent(url)}`;
        return axios.get(modifiedUrl);
      })
      .then((response) => {
        const id = uniqueId();
        parser(watch, response.data, 'new', id);
        return id;
      })
      .then((id) => {
        watch.newFeedId = id;
        state.addedUrls.push(url);
        tracking(watch, url, i18nInstance, id);
        watch.dataLoading.state = 'successful';
        watch.dataLoading.state = 'waiting';
      })
      .catch((err) => {
        watch.formValidation.state = 'invalid';
        watch.dataLoading.state = 'failed';
        watch.dataLoading.error = err;
        watch.error = err;
      });
  });
};
