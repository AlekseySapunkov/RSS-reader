import onChange from 'on-change';
import render from './renderLinks.js';

const createList = (type, i18n) => {
  const container = document.querySelector(`.${type}`);
  container.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');
  container.append(div);
  const cardBody = `<div class="card-body"><h2 class="card-title h4">${i18n.t(type)}</h2></div>`;
  div.innerHTML = cardBody;

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(list);

  return list;
};

const createFeedbackContainer = () => {
  const feedbackContainer = document.querySelector('.feedback');
  feedbackContainer.classList.remove('text-success');
  feedbackContainer.classList.add('text-danger');
  return feedbackContainer;
};

const renderPosts = (posts, list, direction, i18n, state) => {
  posts.forEach((post) => {
    const listEl = document.createElement('li');
    listEl.classList.add('list-group-item', 'd-flex', 'justify-content-between');
    listEl.classList.add('align-items-start', 'border-0', 'border-end-0');
    if (direction === 'append') {
      list.append(listEl);
    } else if (direction === 'prepend') {
      list.prepend(listEl);
    }

    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.classList.add('fw-bold');
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;
    listEl.append(link);

    const watchedState = onChange(state, render(post));

    link.addEventListener('click', () => {
      watchedState.viewedPost = post.id;
    });

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('button');
    listEl.append(button);

    button.addEventListener('click', () => {
      watchedState.viewedPost = post.id;
    });
  });
};

export default (state, form, i18n) => (path, value, prevValue) => {
  if (path === 'error') {
    form.elements.url.classList.add('is-invalid');
    const feedbackContainer = createFeedbackContainer();
    if (value.name === i18n.t('errorNames.validation')) {
      if (value.errors.toString() === i18n.t('errors.invalidUrl')) {
        feedbackContainer.textContent = i18n.t('errors.invalidUrl');
      } else if (value.errors.toString() === i18n.t('errors.addedRss')) {
        feedbackContainer.textContent = i18n.t('errors.addedRss');
      }
    } else if (value.name === i18n.t('errorNames.axios')) {
      feedbackContainer.textContent = i18n.t('errors.network');
    }
  }
  if (path === 'parsingErrors') {
    form.elements.url.classList.add('is-invalid');
    const feedbackContainer = createFeedbackContainer();
    feedbackContainer.textContent = i18n.t('errors.invalidRss');
  }
  if (path === 'feeds') {
    const list = createList('feeds', i18n);
    state.feeds.forEach((feed) => {
      const listEl = document.createElement('li');
      listEl.classList.add('list-group-item', 'border-0', 'border-end-0');
      list.prepend(listEl);

      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.title;
      listEl.append(title);

      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.description;
      listEl.append(description);
    });
    const input = form.elements.url;
    input.classList.remove('is-invalid');
    form.reset();
    input.focus();

    const feedbackContainer = document.querySelector('.feedback');
    feedbackContainer.classList.remove('text-danger');
    feedbackContainer.classList.add('text-success');
    feedbackContainer.textContent = i18n.t('success');
  }
  if (path === 'newFeedId' && !prevValue) {
    const list = createList('posts', i18n);
    const { posts } = state;
    renderPosts(posts, list, 'append', i18n, state);
  }
  if (path === 'newFeedId' && prevValue) {
    const list = document.querySelector('.posts ul');
    const posts = state.posts.filter(({ feedId }) => value === feedId).reverse();
    renderPosts(posts, list, 'prepend', i18n, state);
  }
  if (path === 'trackingPosts') {
    const list = document.querySelector('.posts ul');
    const existingPosts = state.posts.map(({ id }) => id);
    const posts = state.trackingPosts.filter(({ id }) => !existingPosts.includes(id)).reverse();
    renderPosts(posts, list, 'prepend', i18n, state);
  }
};
