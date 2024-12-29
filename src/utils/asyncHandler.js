//middleware = higher order function which can accept functions to execute accordingly
//higher order function accepts function as parameter and calls it using request(req), response(res) and next flag(next) parameters
//using promises

const asyncHandler = ( requestHandler ) => {
    return ( req, res, next ) => {
        Promise.resolve( requestHandler( req, res, next )).catch( (err) => {
            next( err )
        })
    }
}

export {asyncHandler}