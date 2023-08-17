const Tickets = require("./models/tickets.model");

class TicketManager {
  constructor() {}

  async getNewTicket() {
    return await Tickets.create({});
  }

  async updateTicket(ticket) {
    return await Tickets.updateOne({ _id: ticket._id }, ticket);
  }
}

module.exports = TicketManager;
