function unsubscribeFromEmails() {
  var threads = GmailApp.search('label:unsubscribe');
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var body = messages[j].getBody();
      Logger.log('Body:');
      //Logger.log(body);
      var unsubscribeLink = getEmailUnsubscribeLink(body);
      Logger.log('Unsubscribe link:');
      Logger.log(unsubscribeLink);
      if (unsubscribeLink) {
        Logger.log('Attempting to unsub from' + unsubscribeLink);
        followUnsubscribeLink(unsubscribeLink);
        threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
        messages[j].markRead();
        break;
      }
      else{
        
        //var header = messages[j].getHeader('List-Unsubscribe');
        //Logger.log(message.getFrom());
        var rawContent = messages[j].getRawContent()
        Logger.log("Entered Else");
        var url = RawListUnsubscribe(rawContent);
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

function RawListUnsubscribe(rawContent) {

    var value = rawContent.match(/^List-Unsubscribe: ((.|\r\n\s)+)\r\n/m);
    //Logger.log(value);
    if (value !== null) {
      var url = value[1].match(/https?:\/\/[^>]+/)[0];
      return url;
    }
}

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

function followUnsubscribeLink(link) {
  var options = {
    followRedirects: false
  };
  UrlFetchApp.fetch(link, options);
}
