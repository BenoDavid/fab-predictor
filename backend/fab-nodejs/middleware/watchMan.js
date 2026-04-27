const watchMan = (req, res, next) => {
    console.log("hello who are you");
    next();
  };
  
  module.exports = watchMan;