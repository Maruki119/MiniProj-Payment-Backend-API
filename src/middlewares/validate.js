function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    req.validated = result.data;
    next();
  };
}

module.exports = validate;