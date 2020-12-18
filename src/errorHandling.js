const notFoundErrorHandler = (err, req, res, next) => {
    if(err.httpStatusCode ===404) {
        res.status(404).send("Error! Not found!")
        next(err)
        }
}

const unauthorizedErrorHandler = (err, req, res, next) => {
    if(err.httpStatusCode ===401)  {
        res.status(401).send("Error! Not authorized!")
        } next(err)
}

const forbiddenErrorHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 403) {
        res.status(403).send("Error! Forbidden!")
    } next(err)
}

const badRequestErrorHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 500) {
        res.status(400).send(err.message)
    } next(err)
}

const catchAllErrorHandler = (err, req, res, next) => {
    if (!res.headerSent) {// check if someone already sent a response
        res.status(err.httpStatusCode || 500).send("Generic! Server Error!")
        }
    }


module.exports = {
    notFoundErrorHandler,
    unauthorizedErrorHandler,
    forbiddenErrorHandler,
    badRequestErrorHandler,
    catchAllErrorHandler,

}

