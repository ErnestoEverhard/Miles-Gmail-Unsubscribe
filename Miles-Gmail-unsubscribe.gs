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
      
      // Try to find an unsubscribe link in the message body
      var unsubscribeLink = getEmailUnsubscribeLink(body);
      Logger.log('Unsubscribe link: ' + unsubscribeLink);
      
      // If an unsubscribe link is found, try to unsubscribe from it
      if (unsubscribeLink) {
        var success = followUnsubscribeLink(unsubscribeLink, messages[j]);
        if (success) {
          threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
          messages[j].markRead();
        } else {
          threads[i].moveToSpam();
        }
        break;
      }
      // If no unsubscribe link is found, try to find a "List-Unsubscribe" header in the raw email content
      // check to see if else
      else {
        var rawContent = messages[j].getRawContent();
        
        if(rawContent){
          Logger.log("Rawcontent is null");
          threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
          messages[j].markRead();
          break;
        }
        var url = RawListUnsubscribe(rawContent);
        
        // If a "List-Unsubscribe" header is found, try to unsubscribe using the URL specified in the header
        if (url) {
          Logger.log(url);
          var status = UrlFetchApp.fetch(url).getResponseCode();
          Logger.log("Unsubscribe " + status + " " + url);
          threads[i].removeLabel(GmailApp.getUserLabelByName('unsubscribe'));
          messages[j].markRead();
          break;
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
function followUnsubscribeLink(link, message) {
  var options = {
    followRedirects: true,
    muteHttpExceptions: true
  };
  if (link && (link.startsWith("http://") || link.startsWith("https://"))) {
    var response = UrlFetchApp.fetch(link, options);
    var content = response.getContentText();
    return checkUnsubscribeSuccess(content, message);
  }
  return false;
}


// This function checks if the unsubscribe process was successful by looking for
// success phrases in the content of the webpage resulting from following the unsubscribe link
function checkUnsubscribeSuccess(content) {
  // List of common success phrases used by websites to confirm a successful unsubscribe
 var successPhrases = [
    "you have been unsubscribed",
    "unsubscription confirmed",
    "successfully unsubscribed",
    "your email has been removed",
    "you've been removed from our list",
    "opt-out successful",
    "you will no longer receive emails from us",
    "we're sorry to see you go",
    "your subscription has been canceled",
    "your request has been processed",
  ];

  // Initialize a variable to store the result of the unsubscribe process
  var success = false;

  // Attempt to parse the HTML content using XmlService
  var htmlDocument;
  try {
    htmlDocument = XmlService.parse(content);
  } catch (error) {
    // If parsing fails, return false (unsuccessful unsubscribe)
    return success;
  }

  // Get the root node of the parsed HTML document
  var rootNode = htmlDocument.getRootElement();

  // Get all text nodes from the HTML document
  var allTextNodes = getTextNodes(rootNode, []);

  // Loop through all text nodes
  allTextNodes.forEach(function (textNode) {
    // Get the text content of the node and convert it to lowercase
    var textContent = textNode.getText().toLowerCase();

    // Loop through the success phrases
    successPhrases.forEach(function (phrase) {
      // If the text content includes a success phrase, set success to true
      if (textContent.includes(phrase)) {
        success = true;
      }
    });
  });

  // Return the result of the unsubscribe process (true if successful, false if not)
  return success;
}

// This function recursively retrieves all text nodes from a given node and its children
function getTextNodes(node, textNodes) {
  // If the node is a text node, add it to the textNodes array
  if (node.getType() === XmlService.ContentTypes.TEXT) {
    textNodes.push(node);
  }
  // If the node is an element node, process its children
  else if (node.getType() === XmlService.ContentTypes.ELEMENT) {
    var children = node.getChildren();
    for (var i = 0; i < children.length; i++) {
      getTextNodes(children[i], textNodes);
    }
  }
  // Return the updated textNodes array
  return textNodes;
}