/**
 * Returns full url, for example, if you pass in "tos", you get back:
 * http://your-domain.dev/tos
 * --
 * @param  {string} uri
 * --
 * @return {string}
 */
function url(uri) {
    var full_url = AJS.Library.Config.get('base_url');

    if (full_url.substr(-1, 1) === '/') { full_url = full_url.substr(0, -1); }
    if (uri.substr(0, 1) === '/') { uri = uri.substr(1); }

    return full_url + '/' + uri;
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