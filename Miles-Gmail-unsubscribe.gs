function unsubscribeFromEmails() {
  // Get all threads with the "unsubscribe" label
  var threads = GmailApp.search('label:unsubscribe');
  
  // Loop through each thread
  for (var i = 0; i < threads.length; i++) {
    // Get all messages in the thread
    var messages = threads[i].getMessages();
    
    // Loop through each message
    for (var j = 0; j < messages.length; j++) {
      // Get the message body
      var body = messages[j].getBody();
      Logger.log('Body:');
      //Logger.log(body);
      
      // Try to find an unsubscribe link in the message body
      var unsubscribeLink = getEmailUnsubscribeLink(body);
      Logger.log('Unsubscribe link:');
      Logger.log(unsubscribeLink);
      
      // If an unsubscribe link is found, try to unsubscribe from it
      if (unsubscribeLink) {
        Logger.log('Attempting to unsub from' + unsubscribeLink);
        followUnsubscribeLink(unsubscribeLink);
        threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
        messages[j].markRead();
        break;
      }
      // If no unsubscribe link is found, try to find a "List-Unsubscribe" header in the raw email content
      else {
        var rawContent = messages[j].getRawContent();
        Logger.log("Entered Else");
        var url = RawListUnsubscribe(rawContent);
        
        // If a "List-Unsubscribe" header is found, try to unsubscribe using the URL specified in the header
        if (url) {
          Logger.log(url);
          var status = UrlFetchApp.fetch(url).getResponseCode();
          Logger.log("Unsubscribe " + status + " " + url);
          threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
          messages[j].markRead();
        }
      }
    }
  }
}

/**
 * Attempts to extract the URL specified in the "List-Unsubscribe" header of an email
 * @param {string} rawContent - The raw email content
 * @return {string|null} - The URL specified in the "List-Unsubscribe" header, or null if the header is not found
 */
function RawListUnsubscribe(rawContent) {
  var value = rawContent.match(/^List-Unsubscribe: ((.|\r\n\s)+)\r\n/m);
  //Logger.log(value);
  if (value !== null) {
    var url = value[1].match(/https?:\/\/[^>]+/)[0];
    return url;
  }
  return null;
}

/**
 * Attempts to extract an unsubscribe link from the body of an email
 * @param {string} body - The body of the email
 * @return {string|null} - The unsubscribe link, or null if no link is found
 */
function getEmailUnsubscribeLink(body) {
  // Search for the word "Unsubscribe"
  var unsubscribeIndex = body.toLowerCase().indexOf("unsubscribe");
  if (unsubscribeIndex != -1) {
    // Check if the word "Unsubscribe" is a link
    var linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/;
    var match = body.substring(unsubscribeIndex).match(linkRegex);
    if (match != null) {
      var unsubscribeLink = match[2];
      // Return the link
      return unsubscribeLink;
    }
  }
  // If no link was found, return null
  return null;
}

/**
 * Follows an unsubscribe link
 */
function followUnsubscribeLink(link) {
  var options = {
    followRedirects: false
  };
  UrlFetchApp.fetch(link, options);
}
