class TicketDTO {
  constructor(info) {
    this.code = info.code;
    this.purchase_datetime = info.purchase_datetime;
    this.amount = info.amount;
    this.purchaser = info.purchaser;
  }
}

module.exports = TicketDTO;
