const cBeen2LongFieldsName = "Been2LongFields";

function shouldShowOnStartup () {

    var reminders = loadAllReminders ( true );

    if ( reminders.length==0 ) {
        return false;
    }

    // reminderSort => most overdue reminder first
    reminders.sort ( reminderSort );

    var mostOverdue = reminders[0].split(";") [0];

    // So if the "most overdue" is in fact overdue (or due), then we should show on startup
    return ( mostOverdue >= 0 );

}

// --------
function reminderSort ( a, b ) {

    // "Days late" is first thing in the ";"-separated list that forms each array.
    // Higher ones should come first, so the "most overdue" reminder is at the top. 
    return ( b.split(";")[0] - a.split(";")[0] );

}



// Returns the card for an email address
function getCard ( emailAddress ) {

    // RDF service to read address book registry
    var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);

    var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);

    // Enumerate subdirectories
    var abSubDirs = abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);

    while (abSubDirs.hasMoreElements()) {
        var abDir = abSubDirs.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);

        var directory = abDir;
        directory = directory.QueryInterface(Components.interfaces.nsIAbDirectory);

        var abCardsEnumerator = directory.childCards;
        var keepGoing = true;

        try {
            abCardsEnumerator.first();
        } catch (ex) {
     	    keepGoing = false;
        }

        while ( keepGoing ) {

     	    var abCard = abCardsEnumerator.currentItem();
     	    abCard = abCard.QueryInterface(Components.interfaces.nsIAbCard);

            if (abCard && abCard.getCardValue("PrimaryEmail").toLowerCase()==emailAddress.toLowerCase() ) {
                return abCard;
            }

            try {
      	        abCardsEnumerator.next();
      	    } catch (ex) {
	        keepGoing = false; 
      	    }

        }

    }

    return null;

}



function setLastWrote ( emailAddress, onDate ){

    var BirthdayFieldName = getB2LFieldName();
    var lB2LValue = {};
    var abCardDirectory;

    var abCard = getCard ( emailAddress );

    if (abCard && abCard.getCardValue("PrimaryEmail").toLowerCase()==emailAddress.toLowerCase() && abCard.getCardValue ( BirthdayFieldName ) ) {
  	  
        lB2LValue = abCard.getCardValue( BirthdayFieldName);  	   

        var setOk = false;
        var lFields = lB2LValue.split ( ";" );

        var lRegularity = lFields [ 0 ];
        var lLastWrote  = onDate;

        lB2LValue = lRegularity + ";" + lLastWrote;

        try { 
            abCard.setCardValue ( BirthdayFieldName, lB2LValue );
            setOk = true;
        } catch ( ex ) {
            // ignore problems updating the card
        }
   
        if ( setOk ) {
            // Commit the change to the database
            abCard.editCardToDatabase ( "" );
            keepGoing=0;  // Maybe not the best idea...
        }

    } // if (abCard)

}


function updateLastWrote ( event ){

    var composeFields = event.currentTarget.gMsgCompose.compFields;
    var recipientList = composeFields.to + "," + 
                        composeFields.cc + "," +
                        composeFields.bcc;

    var recipientArray = composeFields.SplitRecipients ( recipientList, true );

    // For each recipient To, CC or BCC:
    for ( var i=0; i<recipientArray.count; i++ ) {

        var thisRecipientEmail = recipientArray.StringAt ( i );

        // Update the Last Wrote Date for this recipient to today
        setLastWrote ( thisRecipientEmail, new Date().getTime() );

    }

    var allWindows = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher).getWindowEnumerator(); 

    // If Been2Long notifications window(s) is/are visible, then refresh it/them
    while ( allWindows.hasMoreElements() ) {
        var thisWindow = allWindows.getNext();

        if ( thisWindow.document.getElementById ("wdw_b2lnotifications") ) {
            thisWindow.displayAllReminders ( );
        }
    }

}

function getPref(Name) {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
                
    if (prefs.getPrefType(Name) == prefs.PREF_STRING){
        return prefs.getCharPref(Name);
    }

    if (prefs.getPrefType(Name) == prefs.PREF_BOOL){
        return prefs.getBoolPref(Name);
    }

}


function setCharPref(Name, Value) {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        
    prefs.setCharPref(Name, Value); 	

}

function isExtensionInstalled (aExtensionID) {

    var ExtManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
    var nsIUpdateItem = Components.interfaces.nsIUpdateItem;
      
    var existingItem = ExtManager.getItemForID(aExtensionID);
	            
    if (existingItem==undefined) return false;
    if (existingItem.installLocationKey=="") return false;
            
    return true;

}


function getB2LFieldName() {
    var sFieldName = "";
 
    try {
        sFieldName = getPref("extensions.been2long@daynemay.b2lfieldname");
    } catch (ex) {
        sFieldName = "Custom4";
    }
 
    if (sFieldName == "") sFieldName = "Custom4";
 
    return sFieldName;

}


function days_between(date1, date2) {

    // milliseconds in a day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Put incoming dates into new variables to avoid them getting zeroed below.
    var firstDate = new Date ( date1 );
    var secondDate = new Date ( date2 );

    firstDate.setHours(0);
    secondDate.setHours(0);
    firstDate.setMinutes(0);
    secondDate.setMinutes(0);
    firstDate.setSeconds(0);
    secondDate.setSeconds(0);

    // Convert both dates to milliseconds
    var date1_ms = firstDate.getTime()
    var date2_ms = secondDate.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = date1_ms - date2_ms

    var returnValue = Math.round(difference_ms/ONE_DAY );

    return returnValue;

}



function setLastReminderMailSendDate(lName, lDoB, lLastSentDate) {

    var lConfig = new Config();
    lConfig.setLastSentDate(lName, lDoB, lLastSentDate);

}



function calcDateOfNextEmail(lLastEmailDate, lRegularity) {

    var lNextEmailDate = new Date ( lLastEmailDate );
    lNextEmailDate.setDate ( lNextEmailDate.getDate () + lRegularity );

    return lNextEmailDate;

}


// ---------------------------------------------------------------------------------------
// This function iterates through all Addresses in Addressbooks. If a birthdate is 
// provided for an address, the birthday is added to the list.
// ----------------------------------------------------------------------------------------

function loadAllReminders( onlyShowDue ) {

    var lReminders;
    var lTodayDate = new Date();
    var lReminders = new Array();

    var stringBundle = document.getElementById("been2long-strings");
    var ldaysLateMessage;
  
    // iterate through all AddressBooks
    
    // Get RDF service to read address book registry
    var abRdf     = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
    var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);

    // Get subdirectories and enumerate them
    var abSubDirs = abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);

    while (abSubDirs.hasMoreElements()) {

        var abDir = abSubDirs.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);

//        var directory = abDir;
//        directory = directory.QueryInterface(Components.interfaces.nsIAbDirectory);
//        var abCardsEnumerator = directory.childCards;

        var abCardsEnumerator = abDir.QueryInterface(Components.interfaces.nsIAbDirectory).childCards;

        var keepGoing = 1; 

        try {
            abCardsEnumerator.first();
        } catch (ex) {
     	    keepGoing = 0;
        }

        while (keepGoing == 1) {

            var abCard = abCardsEnumerator.currentItem();
            abCard = abCard.QueryInterface(Components.interfaces.nsIAbCard);

            if (abCard) {

                var sBirthdayFieldName = getB2LFieldName();  	   
                var lB2LValue = {};

                lB2LValue = abCard.getCardValue(sBirthdayFieldName);  	   

  	        if (lB2LValue) {

                    var lFields = lB2LValue.split ( ";" );
		    var lRegularity = lFields [ 0 ];

                    var lLastWrote  = lFields [ 1 ];
                    var lLastWroteDate = new Date ( parseInt ( lLastWrote ) );

                    var lnextEmail = calcDateOfNextEmail(lLastWrote, lRegularity);			
                    var ldaysSinceLastEmail = days_between(lTodayDate, lLastWroteDate );
                    var ldaysUntilNextEmail = days_between(lnextEmail, lTodayDate);

                    var ldaysLate           = ldaysSinceLastEmail - lRegularity;

      	   	    if (!onlyShowDue || ldaysLate>=0) {
      	   	
                        var lEmailAddress = abCard.getCardValue ( "PrimaryEmail" );
                        var lDisplayName  = abCard.getCardValue ( "DisplayName"  );
                        var lFirstName    = abCard.getCardValue ( "FirstName"    );
                        var lLastName     = abCard.getCardValue ( "LastName"     );
			var lName;

                        if ( lDisplayName != "" ) {
                            lName = lDisplayName;
                        } else if ( lFirstName != "" || lLastName != "" ) {
                            lName = lFirstName + " " + lLastName;
                        } else {
                            lName = lEmailAddress;
                        }

                        ldaysLateMessage = "";

                        try 
                        {
                            if (ldaysLate==0) { 
                                ldaysLateMessage = stringBundle.getString ( "DueMessageToday" ); // "Due today"; 
                            }

                            if (ldaysLate==1) {
                                ldaysLateMessage = stringBundle.getString ( "DueMessageYesterday" ); // "One day late";
                            } 

                            if ( ldaysLate==-1) {
                                ldaysLateMessage = stringBundle.getString ( "DueMessageTomorrow" ); // "Due tomorrow"; 
                            }

                            // getFormattedString doesn't seem to be working, hence this hack
                            if ( ldaysLate<-1) {
                                ldaysLateMessage = stringBundle.getString ( "DueMessageInDays" );
                                ldaysLateMessage = ldaysLateMessage.replace ( "%s", ( 0 - ldaysLate ) ); // "Due in " + ( 0 - ldaysLate ) + " days";
                            }

                            if ( ldaysLate>1) {
                                ldaysLateMessage = stringBundle.getString ( "DueMessageDaysAgo" );
                                ldaysLateMessage = ldaysLateMessage.replace ( "%s", ldaysLate ); // "Due in " + ( 0 - ldaysLate ) + " days";
                            }

                        }
                        catch ( ex ) 
                        {
                        }

                        // In case of ; in name.  Will be re-replaced at the other end.
                        lName = lName.replace ( ";", "been2longsemicolon" );

			var sListBoxEntry= ldaysLate          + ";" +
                                           lName              + ";" + 
                                           ldaysLateMessage   + ";" + 
                                           lLastWroteDate     + ";" + 
                                           lRegularity        + ";" + 
                                           lEmailAddress;

                        lReminders.push ( sListBoxEntry );     

                    }

                } // if (lB2LValue)

            } // if (abCard)

            try {

      	        abCardsEnumerator.next();

      	    } catch (ex) {
		keepGoing = 0; 
      	    }

        } // while ( keepGoing ) 

    } //   while (abSubDirs.hasMoreElements())

    return lReminders;

}  // function loadAllReminders()
