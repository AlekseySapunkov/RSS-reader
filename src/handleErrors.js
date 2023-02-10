export default (error) => {
  switch (error.message) {
    case 'Network Error':
      return 'networkError';
    case 'Parsing Error':
      return 'invalidRSS';
    default:
      return 'defaultError';
  }
};
