using System.Net.Mail;
using System.Net;

namespace FinalProjectAPIs.Helper
{
    public class EmailHelper
    {
        public static async Task SendPasswordResetEmail(
            IConfiguration config,
            string to,
            string subject,
            string body)

        {
            var host = config["Smtp:Host"];
            var port = int.Parse(config["Smtp:Port"]!);
            var from = config["Smtp:User"]!;
            var pass = config["Smtp:Pass"]!;

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = false,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(from, pass),
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            using var message = new MailMessage(
                from: from,
                to: to,
                subject: subject,
                body: body
            );

            try
            {
                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Full error: {ex}");
                throw;
            }
        }
    }
}
