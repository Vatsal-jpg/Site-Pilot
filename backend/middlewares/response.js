const responseFormatter = (req, res, next) => {
    res.sendResponse = (
        statusCode = 200,
        success = true,
        message = "",
        data = null
    ) => {
        return res.status(statusCode).json({
            success,
            message,
            data
        });
    };

    next();
};

export default responseFormatter;
