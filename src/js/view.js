const renderErrors = (elements, i18Instance) => {
    const {
      inputField,
      feedBackField,
      fieldset,
    } = elements;
    inputField.classList.add('is-invalid');
    feedBackField.classList.add('text-danger');
    feedBackField.classList.remove('text-success');
    feedBackField.textContent = i18Instance;
    fieldset.removeAttribute('disabled', 'disabled');
  };
  
  const renderFeedsContainer = (elements, i18n) => {
    const { feedsContainer } = elements;
    feedsContainer.textContent = '';
    const feedCard = document.createElement('div');
    const feedCardBody = document.createElement('div');
    const feedCardTitle = document.createElement('h2');
    const feedsUl = document.createElement('ul');
  
    feedCard.classList.add('card', 'border-0');
    feedCardBody.classList.add('card-body');
    feedCardTitle.classList.add('card-title', 'h4');
    feedsUl.classList.add('list-group', 'border-0', 'rounded-0');
    feedsUl.setAttribute('id', 'feedUl');
    feedCardBody.append(feedCardTitle);
    feedCardTitle.textContent = i18n.t('titles.feeds');
    feedCard.append(feedCardBody, feedsUl);
    feedsContainer.append(feedCard);
  };
  
  const renderFeedItem = (feed) => {
    const feedLi = document.createElement('li');
    const feedTitle = document.createElement('h3');
    const feedDescription = document.createElement('p');
    const feedsUl = document.querySelector('#feedUl');
    feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedTitle.classList.add('h6', 'm-0');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedTitle.textContent = feed.title;
    feedDescription.textContent = feed.description;
    feedLi.append(feedTitle);
    feedLi.append(feedDescription);
    feedsUl.prepend(feedLi);
  };
  
  const renderFeeds = (state, elements, i18n) => {
    renderFeedsContainer(elements, i18n);
    state.feeds.forEach((feed) => {
      renderFeedItem(feed);
    });
  };
  
  const renderPostsContainer = (state, elements, i18) => {
    const { postsContainer } = elements;
    postsContainer.textContent = '';
    const postCard = document.createElement('div');
    const postCardBody = document.createElement('div');
    const postCardTitle = document.createElement('h2');
    const postsUl = document.createElement('ul');
  
    postCard.classList.add('card', 'border-0');
    postCardBody.classList.add('card-body');
    postCardTitle.classList.add('card-title', 'h4');
    postsUl.classList.add('list-group', 'border-0', 'rounded-0');
    postsUl.setAttribute('id', 'postsUl');
    postCardTitle.textContent = i18.t('titles.posts');
    postCard.append(postCardBody, postsUl);
    postCardBody.append(postCardTitle);
    postsContainer.append(postCard);
  
    state.rssLinks.forEach((link) => {
      const div = document.createElement('div');
      div.setAttribute('id', `${link}`);
      postsContainer.append(div);
    });
  };
  
  const renderPostItem = (post, state, i18) => {
    const postLi = document.createElement('li');
    const postHref = document.createElement('a');
    const postButton = document.createElement('button');
    postHref.setAttribute('href', post.postLink);
    postHref.setAttribute('target', '_blank');
    postLi.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    if (state.ui.viewedPostLinks.has(post.postLink)) {
      postHref.classList.add('fw-normal');
    } else {
      postHref.classList.add('fw-bold');
    }
    postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postButton.setAttribute('data-bs-dismiss', 'modal');
    postButton.setAttribute('data-bs-toggle', 'modal');
    postButton.setAttribute('data-bs-target', '#modal');
  
    postHref.textContent = post.postTitle;
    postButton.textContent = i18.t('button.view');
  
    postLi.append(postHref, postButton);
    return postLi;
  };
  
  const renderPosts = (state, elements, i18) => {
    renderPostsContainer(state, elements, i18);
    state.rssLinks.forEach((link) => {
      const postsUl = document.getElementById(`${link}`);
      state.posts.forEach((post) => {
        if (post.post.rssLink === link) {
          postsUl.append(renderPostItem(post.post, state, i18));
        }
      });
    });
  };
  
  const findPostByLink = (url, state) => {
    const posts = state.posts.filter((post) => post.post.postLink === url);
    return posts[0];
  };
  
  const renderModal = (state) => {
    const href = state.ui.clickedLink;
    const post = findPostByLink(href, state);
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const a = document.querySelector('.full-article');
    a.href = href;
    modalTitle.textContent = post.post.postTitle;
    modalBody.textContent = post.post.postDescription;
  };
  
  const renderForm = (state, elements, i18Instance) => {
    const {
      feedBackField,
      inputField,
      form,
    } = elements;
    feedBackField.textContent = i18Instance.t('watching');
    switch (state.status) {
      case 'processing':
        feedBackField.classList.add('text-success');
        feedBackField.classList.remove('text-danger');
        feedBackField.textContent = i18Instance.t('watching');
        break;
      case 'processed':
        inputField.classList.add('is-valid');
        inputField.classList.remove('is-invalid');
        feedBackField.classList.add('text-success');
        feedBackField.classList.remove('text-danger');
        feedBackField.textContent = i18Instance.t('rssAdded');
        renderPosts(state, elements, i18Instance);
        form.elements.url.value = '';
        break;
      case 'processingErrors': {
        feedBackField.classList.add('text-success');
        feedBackField.classList.remove('text-danger');
        feedBackField.textContent = i18Instance.t('watching');
        break;
      }
      default:
        throw new Error('Unexpected status value');
    }
  };
  
  const disableForm = (state, elements) => {
    const { fieldset } = elements;
    if (state.isDisabled) {
      fieldset.setAttribute('disabled', state.isDisabled);
    } else {
      fieldset.removeAttribute('disabled', 'disabled');
    }
  };
  
  export {
    renderErrors,
    renderFeeds,
    renderPosts,
    renderModal,
    renderForm,
    disableForm,
  };