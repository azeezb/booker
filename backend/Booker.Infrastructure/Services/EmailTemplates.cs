using System.Net;

namespace Booker.Infrastructure.Services;

public static class EmailTemplates
{
    private const string Stone50 = "#fafaf9";
    private const string Stone100 = "#f5f5f4";
    private const string Stone200 = "#e7e5e4";
    private const string Stone400 = "#a8a29e";
    private const string Stone500 = "#78716c";
    private const string Stone600 = "#57534e";
    private const string Stone800 = "#292524";
    private const string Amber50 = "#fffbeb";

    private const string SerifFont = "Georgia,'Times New Roman',serif";
    private const string SansFont = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

    private static string Wrap(string eyebrow, string title, string body, string appUrl) => $"""
        <body style="margin:0;background:{Stone100};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,{Stone50},{Amber50},{Stone100});padding:48px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:28px;border:1px solid {Stone200};">
                  <tr>
                    <td style="padding:40px 36px;">
                      <p style="margin:0 0 32px;font-family:{SerifFont};font-weight:600;letter-spacing:0.02em;font-size:20px;color:{Stone800};">Booker</p>
                      <p style="margin:0 0 10px;font-family:{SansFont};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:{Stone400};">{eyebrow}</p>
                      <h1 style="margin:0 0 20px;font-family:{SerifFont};font-weight:300;font-size:28px;line-height:1.2;color:{Stone800};">{title}</h1>
                      <div style="font-family:{SansFont};font-size:14px;line-height:1.7;color:{Stone600};">
                        {body}
                      </div>
                      <a href="{appUrl}" style="display:inline-block;margin-top:28px;background:{Stone800};color:#ffffff;text-decoration:none;font-family:{SansFont};font-size:12px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 30px;border-radius:999px;">
                        Open Booker
                      </a>
                      <p style="margin:36px 0 0;font-family:{SerifFont};font-style:italic;font-size:12px;color:{Stone400};">Booker &mdash; your book club, organized.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        """;

    public static string GetBookReminderEmail(string memberName, string clubName, string bookTitle, string author, DateTime meetingDate, string appUrl)
    {
        memberName = WebUtility.HtmlEncode(memberName);
        clubName = WebUtility.HtmlEncode(clubName);
        bookTitle = WebUtility.HtmlEncode(bookTitle);
        author = WebUtility.HtmlEncode(author);

        return Wrap("Reminder", "Time to grab your book", $"""
            <p style="margin:0 0 14px;">Hi {memberName},</p>
            <p style="margin:0;">
              <strong style="color:{Stone800};">{clubName}</strong> meets on
              <strong style="color:{Stone800};">{meetingDate:dddd, MMMM d}</strong> to discuss
              <strong style="color:{Stone800};">{bookTitle}</strong> by {author}. You haven't marked that
              you've got a copy yet &mdash; grab one so you're ready in time.
            </p>
            """, appUrl);
    }

    public static string SetNextBookNudgeEmail(string ownerName, string clubName, DateTime lastMeetingDate, string appUrl)
    {
        ownerName = WebUtility.HtmlEncode(ownerName);
        clubName = WebUtility.HtmlEncode(clubName);

        return Wrap("Nudge", "Pick your next book", $"""
            <p style="margin:0 0 14px;">Hi {ownerName},</p>
            <p style="margin:0;">
              It's been a week since <strong style="color:{Stone800};">{clubName}</strong>'s meeting on
              <strong style="color:{Stone800};">{lastMeetingDate:dddd, MMMM d}</strong>, and the next meeting
              still doesn't have a book assigned. Set one now so members have time to read.
            </p>
            """, appUrl);
    }
}
