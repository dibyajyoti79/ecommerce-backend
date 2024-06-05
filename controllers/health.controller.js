export const healthCheck = (req, res) => {
  res.status(200).send({
    status: "Ok",
  });
};
