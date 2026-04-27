exports.sendResponse = (res, statusCode, message, result = null) => {
    res.status(statusCode).json({
      status: statusCode,
      message: message,
      result: result
    });
  };