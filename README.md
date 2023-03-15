# Miles-Gmail-Unsubscribe

This Google Apps Script automates the process of unsubscribing from unwanted emails in Gmail. Users can label the emails they want to unsubscribe from with the "unsubscribe" label, and the script will search for an unsubscribe link in the email body or a "List-Unsubscribe" header in the raw email content. Additionally, the script checks the content of the unsubscribe landing page to verify if the unsubscribe was successful. If the process appears unsuccessful, the script will mark the email as spam.

## Features

- Automatically processes emails labeled with "unsubscribe"
- Extracts unsubscribe links from email content or "List-Unsubscribe" header
- Follows unsubscribe links and checks for a confirmation message on the resulting webpage
- Marks emails as read and removes the "unsubscribe" label upon successful unsubscribe
- Moves emails to spam folder if the unsubscribe process is unsuccessful

## Usage

1. Open Google Drive and create a new Google Apps Script file.
2. Name the file however you'd like.
3. Copy and paste the entire "Miles-Gmail-unsubscribe.gs" script into the new script file.
4. Save the script and grant it the necessary permissions.
5. Label the emails you want to unsubscribe from with the "unsubscribe" label.
6. Run the `unsubscribeFromEmails` function in the script editor.
7. Check your email to see if the "unsubscribe" label has been removed from successfully unsubscribed emails, or if the email has been moved to the spam folder for unsuccessful attempts.
8. You can set up a trigger on the left hand side to run this script hourly. This will allow you to label emails as unsubscribe and not worry about them anymore.

## Customization

You can customize the success phrases in the `checkUnsubscribeSuccess()` function by modifying the `successPhrases` array. Add or remove phrases as needed to improve the accuracy of the unsubscribe success verification.

```javascript
var successPhrases = ["you have been unsubscribed", "unsubscription confirmed", "successfully unsubscribed", "your email has been removed"];
