// ---------------------------------------------------------------------------------------
// This function repeats a string for a certain number of times. 
// ---------------------------------------------------------------------------------------

function repeat(repeatString, repeatNum, returnNum) {

    var newString = "";

    returnNum += "";

    if (returnNum == "undefined" || returnNum == "0") { return ""; }

    for (var x=1; x<=parseInt(repeatNum, 10); x++) {
        newString = newString + repeatString;
    }

    if (newString == "") {

        return (newString);

    } else {

        return (newString.substring(0, parseInt(returnNum, 10)));

    }

}



  
// -------------------------------------------------------------------------------------

function displayAllReminders() {

    var onlyShowDue = document.getElementById("been2long_due").selected;

    var lReminders = loadAllReminders ( onlyShowDue );
  
    // delete all items currently in listbox
    var theList = document.getElementById('theListBox');
    while (theList.getRowCount()>0) {
        theList.removeItemAt(0);
    }

    if (lReminders.length==0) {
	
        var strbundle = document.getElementById("been2long-strings");
        var noRemindersFoundMessage = strbundle.getString ( 'noRemindersFoundMessage' )
        row = document.createElement('listitem');
        row.setAttribute('label', noRemindersFoundMessage );
        theList.appendChild( row );  		    	
    }
 

    lReminders.sort( reminderSort );
   
    var row = {};
    for (var i = 0; i < lReminders.length; ++i) {

        var lThis = lReminders[i].split(";");

        row = document.createElement('listitem');

        // Create and attach cells
        for (var j=1; j<5; ++j) {

            var cell = document.createElement('listcell');

            lThis[j] = lThis[j].replace ("been2longsemicolon", ";" );

            cell.setAttribute('label', lThis[j] );

            row.appendChild( cell );

        } // for j

        // Set the email address to the label, for the send on double-click
        row.setAttribute('label', lThis[5]);
        theList.appendChild( row );  		

    } // for i
   
}  // function displayAllReminders()



// -------------------------------------------------------------------------------------
function addB2L() {

    // Open the Add/Edit window.
    MyWindows = window.openDialog("chrome://been2long/content/wdw_addedit.xul", 
                                  "", 
                                  "chrome,centerscreen,modal",
                                  "add",
                                  "" );
    displayAllReminders ();

}

// -------------------------------------------------------------------------------------
function editB2L() {

    try {
        var currentEmailAddress = document.getElementById("theListBox").selectedItem.label;
    } catch (ex) {
        // If nothing was selected, we would have got an exception.  Ignore it.
    }

    if ( currentEmailAddress == null ) {
        return;
    }

    MyWindows = window.openDialog("chrome://been2long/content/wdw_addedit.xul", 
                                  "",
                                  "chrome,centerscreen,modal",
                                  "edit",
                                  currentEmailAddress);

  displayAllReminders ();
                                                                                                                                                                                                                                                                                                                                                                                                                
}


// -------------------------------------------------------------------------------------
function deleteB2L() {

    var theList = document.getElementById('theListBox');

    // Get currently highlighted B2L
    if (theList.selectedItem.label == "undefined") {
        return;
    }

    var emailAddress = theList.selectedItem.label;

    // Find address book entry
    var abCard = getCard ( emailAddress );

    if ( ! abCard ) 
        return;

    // Determine which custom field contains been2long data
    var B2LField = getB2LFieldName();

    // Clear that field
    abCard.setCardValue ( B2LField, "" );
    abCard.editCardToDatabase ( "" );

    // Refresh the reminder list
    displayAllReminders();

}




// -------------------------------------------------------------------------------------
function about() {
    MyWindows = window.open("chrome://been2long/content/wdw_about.xul", 
                            "", 
                            "chrome,centerscreen");
}


// -------------------------------------------------------------------------------------
function configure() {
    MyWindows = window.open("chrome://been2long/content/wdw_configuration.xul", 
                            "", 
                            "chrome,centerscreen,modal");
    displayAllReminders();
}

String.prototype.trim = function()
{
    return this.replace(/^\s*([^ ]*)\s*$/, "$1");
}


// -------------------------------------------------------------------------------------
function listBoxDblClick() {

    var theList = document.getElementById('theListBox');      
    var row = theList.selectedItem;

    if ( theList.selectedItem.label == "<none>" ) {
        return;
    }

    if (theList.selectedItem.label == "undefined") {
        alert("No email address defined for this person.");
        return;
    }

    var msgComposeType = Components.interfaces.nsIMsgCompType;
    var msgComposeFormat = Components.interfaces.nsIMsgCompFormat;
    var msgComposeService = Components.classes["@mozilla.org/messengercompose;1"].getService();
    msgComposeService = msgComposeService.QueryInterface(Components.interfaces.nsIMsgComposeService);

    var params = Components.classes["@mozilla.org/messengercompose/composeparams;1"].createInstance(Components.interfaces.nsIMsgComposeParams);
    if (params) {
        params.type = msgComposeType.New;
        params.format = msgComposeFormat.Default;
        var composeFields = Components.classes["@mozilla.org/messengercompose/composefields;1"].createInstance(Components.interfaces.nsIMsgCompFields);

        if (composeFields) {
    
            composeFields.to = theList.selectedItem.label;
 
            params.composeFields = composeFields;
            msgComposeService.OpenComposeWindowWithParams(null, params);
        }

    }

}  // function listBoxDblClick


// -------------------------------------------------------------------------------------
function do_close() {
    close();
}
