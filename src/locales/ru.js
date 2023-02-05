const url = new URL('https://allorigins.hexlet.app/get?disableCache=true&url=');

export default {
  translation: {
    proxy: `${url}`,
    feeds: 'Фиды',
    posts: 'Посты',
    button: 'Просмотр',
    success: 'RSS успешно загружен',
    loading: 'RSS загружается',
    errorNames: {
      validation: 'ValidationError',
      axios: 'AxiosError',
    },
    errors: {
      invalidUrl: 'Ссылка должна быть валидным URL',
      invalidRss: 'Ресурс не содержит валидный RSS',
      addedRss: 'RSS уже существует',
      network: 'Ошибка сети',
    },
  },
};
