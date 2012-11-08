/**
 * Returns full url, for example, if you pass in "tos", you get back:
 * http://your-domain.dev/tos
 * --
 * @param  {string} uri
 * --
 * @return {string}
 */
function url(uri) {
    var base_url = AJS.Library.Config.get('base_url');

    if (base_url.substr(-1, 1) === '/') { base_url = base_url.substr(0, -1); }
    if (uri.substr(0, 1) === '/') { uri = uri.substr(1); }

    return base_url + '/' + uri;
}

/**
 * Translate string.
 * --
 * @param  {string} key
 * @param  {array}  params
 * --
 * @return {string}
 */
function l(key, params) {
    return AJS.Library.Language.translate(key, params);
}