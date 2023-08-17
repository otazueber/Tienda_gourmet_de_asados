class TicketManager {
  constructor() {}

  getNewTicket() {
    return {
      code: "123456",
      purchase_datetime: Date.now(),
      amount: 0,
      purchaser: "",
    };
  }

  updateTicket(ticket) {
    return ticket;
  }
}

module.exports = TicketManager;
