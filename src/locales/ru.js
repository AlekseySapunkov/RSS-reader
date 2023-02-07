import { setLocale } from 'yup';

setLocale({
  string: {
    url: 'validError',
    required: 'emptyError',
    notOneOf: 'existsError',
  },
  mixed: {
    notOneOf: 'existsError',
  },
});

export default {
  translation: {
    feeds: 'Фиды',
    posts: 'Посты',
    buttonTextShow: 'Просмотр',
    success: 'RSS успешно загружен',
    loading: 'RSS загружается',
    close: 'Закрыть',
    openFull: 'Читать полную версию',
    validation: 'ValidationError',
    axios: 'AxiosError',
    validError: 'Ссылка должна быть валидным URL',
    invalidRSS: 'Ресурс не содержит валидный RSS',
    existsError: 'RSS уже существует',
    networkError: 'Ошибка сети',
  },
};
