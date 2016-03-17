function Config() {
    this.onload = null;
    this.scripts = null;
  
    var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile);
                       
    file.append("been2long.xml"); 
  
    this.configFile = file;
    this.doc = null;
  
}

// ------------------------------------------------------------------------------
Config.prototype.findNode = function (lName, lDoB) {

    if (this.doc==null) return null;
    if (this.doc.documentElement==null) return null;
  
    var currentnode = this.doc.documentElement.firstChild;
    var nodeTypeElement = 1; // W3C - Konstanten 
  
    //alert(currentnode.nodeType);
    while (currentnode!=null) {
  
        // only look at elements, ignore all other nodes
        if (currentnode.nodeType==nodeTypeElement) {
 	
            // alert(currentnode.tagName);
            // Nodes with tag "RemindersSent" are interesting for us
            if (currentnode.tagName=="RemindersSent") {
                // primary key is Name and DateofBirth
                if ((currentnode.getAttribute("Name") == lName) && 
                    (currentnode.getAttribute("DateofBirth") == lDoB)) {
                    break;
                } // if
            }
        }

        currentnode = currentnode.nextSibling;

    }  // while;

    return currentnode;

}

// ------------------------------------------------------------------------------

Config.prototype.getLastSentDate = function(lName, lDoB){

    this.load();
    var node = this.findNode(lName, lDoB);
    if (node!=null) return node.getAttribute("LastSentDate");
    return node;   
}

// ------------------------------------------------------------------------------

Config.prototype.read = function() {

    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    } catch (e) {
        //alert("Permission to read file was denied.");
    }

    if ( this.configFile.exists() == false ) {
        //alert("File does not exist: "+this.configFile.path);        return ("");
    }

    var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance( Components.interfaces.nsIFileInputStream );

    is.init( this.configFile,0x01, 00004, null);
    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance( Components.interfaces.nsIScriptableInputStream );

    sis.init( is );
    var output = sis.read( sis.available() );

    return (output);

}

// ------------------------------------------------------------------------------

Config.prototype.save = function (lContents) {

    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    } catch (e) {
        //alert("Permission to save file was denied.");
    }
	
    if ( this.configFile.exists() == false ) {
        //alert( "Creating file... " );
	this.configFile.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
    }

    var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream );

	/* Open flags 
	#define PR_RDONLY       0x01
	#define PR_WRONLY       0x02
	#define PR_RDWR         0x04
	#define PR_CREATE_FILE  0x08
	#define PR_APPEND       0x10
	#define PR_TRUNCATE     0x20
	#define PR_SYNC         0x40
	#define PR_EXCL         0x80
	*/

	/*
	** File modes ....
	**
	** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
	** The 'mode' argument may be ignored by PR_Open on other platforms.
	**
	**   00400   Read by owner.
	**   00200   Write by owner.
	**   00100   Execute (search if a directory) by owner.
	**   00040   Read by group.
	**   00020   Write by group.
	**   00010   Execute by group.
	**   00004   Read by others.
	**   00002   Write by others
	**   00001   Execute by others.
	**
	*/

    outputStream.init( this.configFile, 0x04 | 0x08 | 0x20, 420, 0 );
    var output = lContents;
    var result = outputStream.write( output, output.length );
    outputStream.close();

}

// ------------------------------------------------------------------------------

Config.prototype.load = function() {

    var domParser = Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);

    var configContents = this.read();
  
    if (configContents == "") {
        this.doc = domParser.parseFromString("<RemindersSentList/>", "text/xml");
    } else {
        //alert(configContents);
        this.doc = domParser.parseFromString(configContents, "text/xml");
        //alert(new XMLSerializer().serializeToString(this.doc));
    }
}




Config.prototype.setLastSentDate = function (lName, lDoB, lLastSentDate)  {

    this.load();
    
    var node = this.findNode(lName, lDoB);

    if (node!=null) {
        node.setAttribute("LastSentDate", lLastSentDate);
    } else {
        var reminderNode = this.doc.createElement("RemindersSent");
        reminderNode.setAttribute("Name", lName);
        reminderNode.setAttribute("DateofBirth", lDoB);
        reminderNode.setAttribute("LastSentDate", lLastSentDate);
    
        this.doc.firstChild.appendChild(this.doc.createTextNode("\n\t"));
        this.doc.firstChild.appendChild(reminderNode);
  	
    }
  
    this.save( new XMLSerializer().serializeToString(this.doc));
    
}
