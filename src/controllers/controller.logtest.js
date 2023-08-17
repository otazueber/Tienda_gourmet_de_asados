const { Router } = require("express");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");

const router = Router();

router.get("/", async (req, res) => {
  req.logger.debug("Mensaje de debug");
  req.logger.http("Mensaje de http");
  req.logger.info("Mensaje de info");
  req.logger.warning("Mensaje de warning");
  req.logger.error("Mensaje de error");
  req.logger.fatal("Mensaje de fatal");
  res
    .status(HTTTP_STATUS_CODES.OK)
    .json({
      message: "Logs enviados. Verifica la consola o el archivo de errores.",
    });
});

module.exports = router;
