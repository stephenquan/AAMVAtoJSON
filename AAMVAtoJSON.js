function AAMVAtoJSON(data) {
    // Detect AAMVA header:
    //   1. First two characters: "@\n"
    //   2. Third character should be 0x1e but we ignore because of South Carolina 0x1c edge condition
    //   3. Next 5 characters either "ANSI " or "AAMVA"
    //   4. Next 12 characters: IIN, AAMVAVersion, JurisdictionVersion, numberOfEntries
    var m = data.match(/^@\n.\r(ANSI |AAMVA)(\d{6})(\d{2})(\d{2})(\d{2})?/);
    if (!m) return null;
    var header = m[0];
    var AAMVAType = +m[1];
    var AAMVAVersion = m[2];
    var IIN = m[3];
    var jurisdictionVersion = +m[4];
    var numberOfEntries = m[5];

    var obj = {
        header: {
            AAMVAType: AAMVAType,
            IIN: IIN,
            AAMVAVersion: AAMVAVersion,
            jurisdictionVersion: jurisdictionVersion
        }
    };

    for (var i = 0; !numberOfEntries || i < numberOfEntries; i++) {
        var entryOffset = header.length + i * 10;
        m = data.substring(entryOffset, entryOffset + 10).match(/(.{2})(\d{4})(\d{4})/);
        if (!m) break;
        var subfileType = m[1];
        var offset = +m[2];
        var length = +m[3];
        if (i === 0) obj.files = [ ];
        obj.files.push(subfileType);
        obj[subfileType] = data.substring(offset + 2, offset + length).trim().split(/\n\r?/).reduce( function (p, c) {
            p[c.substring(0,3)] = c.substring(3);
            return p;
        }, { } );
    }

    // Convert date string (in local timezone) into Javascript UTC time
    function convertAAMVADate(str, country) {
        function convertMMDDCCYY(str) {
            var m = str.match(/(\d{2})(\d{2})(\d{4})/) || [ ];
            if (!m) return null;
            var month = +m[1];
            var day = +m[2];
            var year = +m[3];
            return new Date(year, month-1, day).getTime();
        }
        function convertCCYYMMDD(str) {
            var m = str.match(/(\d{4})(\d{2})(\d{2})/) || [ ];
            if (!m) return null;
            var year = +m[1];
            var month = +m[2];
            var day = +m[3];
            return new Date(year, month-1, day).getTime();
        }
        switch (country) {
        case "USA": return convertMMDDCCYY(str);
        case "CAN": return convertCCYYMMDD(str);
        default: return convertCCYYMMDD(str);
        }
    } 
    
    if (obj.DL) {
        ["DBA", "DBB", "DBD", "DDB", "DDC", "DDH", "DDI", "DDJ"].forEach( function (k) {
            if (!obj.DL[k]) return;
            var t = convertAAMVADate(obj.DL[k], obj.DL.DCG);
            if (!t) return;
            obj.DL[k] = t;
        } );
    }
    
    return JSON.stringify(obj);
}
