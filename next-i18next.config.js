module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: process.env.PLAYWRIGHT === "1" ? ['en'] : ['en', 'de-DE'],
        fallbackLng: 'en',
        reloadOnPrerender: process.env.NODE_ENV === "production" ? false : true,
        nsSeparator: false,
        keySeparator: false
    },
};