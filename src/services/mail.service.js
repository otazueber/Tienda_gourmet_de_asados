const MailAdapter = require("../adapters/mail.adapter");
const APP_CONST = require("../commons/constants/appConstants");
const { generateEmailToken } = require("../utils/token.utils");

class MailService {
  sendMailUsersDeleted(users) {
    if (users) {
      const mailOptions = {
        from: APP_CONST.EMAIL_FROM,
        to: "",
        subject: "Importante: Eliminación de Cuenta por Inactividad",
        html: "",
      };
      users.forEach((u) => {
        mailOptions.to = u.email;
        mailOptions.html = this.internalGetCustomizedDeleteUserMessage(u);
        MailAdapter.send(mailOptions);
      });
    }
  }
  sendEmailConfirmation(user) {
    if (user) {
      const mailOptions = {
        from: APP_CONST.EMAIL_FROM,
        to: user.email,
        subject: "Confirmación de Registro: Activa tu Cuenta de Correo Electrónico",
        html: this.internalGetCustomizedConfirmationUserMessage(user),
      };
      MailAdapter.send(mailOptions);
    }
  }
  sendEmailResetPassword(req, token) {
    if (token) {
      const { email } = req.body;
      const resetLink = `http://localhost:8080/auth/reset-password/${token}`;
      const mailOptions = {
        from: APP_CONST.EMAIL_FROM,
        to: email,
        subject: "Restablecimiento de contraseña",
        html: `Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña. Ten encuenta que el enlace expirará en 1 hora.`,
      };
      MailAdapter.send(mailOptions);
    }
  }
  internalGetCustomizedConfirmationUserMessage(user) {
    return `<h3>Estimado/a ${user.first_name} ${user.last_name}.</h3><br><br>

Es un placer darle la bienvenida a nuestra plataforma y agradecemos su registro en nuestra comunidad. Para garantizar la seguridad y la integridad de su cuenta, le pedimos que complete el proceso de confirmación haciendo clic en el enlace que se proporciona a continuación:<br><br>
Enlace de Confirmación: <a href="${this.internalGetUrlConfirmationMail(user.email)}">aquí</a><br><br>
Al confirmar su dirección de correo electrónico, tendrá acceso completo a todas las funciones y beneficios que nuestra plataforma tiene para ofrecer. Esto incluye la posibilidad de recibir actualizaciones, comunicaciones importantes y participar en actividades exclusivas.<br><br>
Por favor, siga estos pasos para confirmar su cuenta:<br><br>
1 - Haga clic en el enlace de confirmación proporcionado arriba.<br>
2 - Si el enlace no es clickeable, cópielo y péguelo en la barra de direcciones de su navegador.<br>
3 - Una vez en la página de confirmación, su cuenta quedará activada y lista para ser utilizada.<br><br>
Recuerde que este enlace de confirmación es válido por un tiempo limitado, por lo que le recomendamos realizar este proceso lo antes posible para asegurarse de que su cuenta quede activada sin problemas.<br><br>
Si ha tenido algún problema durante el proceso de confirmación o tiene preguntas adicionales, no dude en responder a este correo electrónico. Estamos aquí para ayudarle en cualquier momento.<br><br>
Gracias por unirse a Non Vegan. Esperamos que tenga una experiencia gratificante y enriquecedora con nosotros.<br><br>
¡Saludos cordiales!<br><br>
El Equipo de Not Vegan S.A.<br>
<a href="http://localhost:8080">www.not_vegan.com.ar</a>`;
  }
  internalGetCustomizedDeleteUserMessage(user) {
    return `<h3>Estimado/a ${user.first_name} ${user.last_name}.</h3><br><br>
Esperamos que estés teniendo un excelente día. <br><br>
Nos ponemos en contacto contigo para informarte sobre un cambio importante relacionado con tu cuenta en nuestra Tienda Gourmet de Asados.<br>
Lamentablemente, hemos observado que tu cuenta ha permanecido inactiva durante un período extendido de tiempo. Con el objetivo de mantener nuestra plataforma segura y eficiente, hemos procedido a eliminar tu cuenta debido a esta inactividad.
Entendemos que pueden surgir ocasiones en las que no se tiene la oportunidad de interactuar con nuestra plataforma. Sin embargo, queremos recordarte que Not Vegan es un lugar vibrante donde puedes encontrar una amplia variedad de productos de alta calidad y aprovechar ofertas exclusivas.
Si deseas seguir siendo parte de nuestra comunidad y disfrutar de las ventajas que ofrecemos, te invitamos cordialmente a volver a visitarnos. Puedes crear una nueva cuenta.<br><br>
Estamos comprometidos en brindarte una experiencia excepcional de compras en línea y en satisfacer todas tus necesidades. Si tienes alguna pregunta o requieres asistencia, no dudes en contactarnos a través de tiendadeasados@gmail.com.<br><br>
Agradecemos tu comprensión y esperamos verte pronto.<br><br>
¡Saludos cordiales!<br><br>
El Equipo de Not Vegan S.A.<br>
<a href="http://localhost:8080">www.not_vegan.com.ar</a>`;
  }
  internalGetUrlConfirmationMail(email) {
    const token = generateEmailToken(email);
    return `http://localhost:8080/auth/confirm-email/${token}`;
  }
}

module.exports = MailService;
