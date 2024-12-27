//middleware = higher order function which can accept functions to execute accordingly

//using promises

const asyncHandler = ( requestHandler ) => {
    ( req, res, next ) => {
        Promise.resolve( requestHandler( req, res, next )).catch( (err) => {
            next( err )
        })
    }
}

export {asyncHandler}