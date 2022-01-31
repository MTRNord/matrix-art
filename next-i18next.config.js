module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'de-DE'],
        fallbackLng: 'en',
        reloadOnPrerender: process.env.NODE_ENV === "production" ? false : true,
        nsSeparator: false,
        keySeparator: false
    },
};