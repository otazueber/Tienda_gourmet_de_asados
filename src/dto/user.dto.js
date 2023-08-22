class UserDTO {
  constructor(info) {
    this.name = info.first_name;
    this.lastname = info.last_name;
    this.fullname = info.first_name + " " + info.last_name;
    this.email = info.email;
    this.role = info.role;
    this.isAdmin = info.role === "admin" ? true : false;
    this.isUser = info.role === "user" ? true : false;
    this.IsPremium = info.role === "premium" ? true : false;
  }
}

module.exports = UserDTO;
