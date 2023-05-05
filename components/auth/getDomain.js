module.exports = function(req) {
//!Attention!
// if reverse proxied get protocol from x-forward-proto or whatever was set up in nginx
    let domain = ""
    if (req.headers["x-forward-proto"]) {
        domain = req.headers["x-forward-proto"]
    } else {
        domain = req.httpVersion < 2 ? "http" : "https"
    }
    domain += "://" + req.headers.host
    return domain
}