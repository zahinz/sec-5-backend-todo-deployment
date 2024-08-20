export function checkHealth(req, res) {
  const object = {
    health: "ok",
  };
  res.status(200).json(object);
}
