export default (post) => (path, value) => {
  if (path === 'viewedPost') {
    const link = document.querySelector(`a[data-id="${value}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal');
    link.classList.add('link-secondary');

    const modalTitle = document.querySelector('.modal-title');
    modalTitle.textContent = post.title;
    const modalBody = document.querySelector('.modal-body');
    modalBody.textContent = post.description;
    const modalLink = document.querySelector('.modal-footer a');
    modalLink.setAttribute('href', post.link);
  }
};
