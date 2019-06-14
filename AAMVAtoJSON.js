function AAMVAtoJSON(data) {
    // Detect AAMVA header:
    //   1. First two characters: "@\n"
    //   2. Third character should be 0x1e but we ignore because of South Carolina 0x1c edge condition
    //   3. Next 5 characters either "ANSI " or "AAMVA"
    //   4. Next 12 characters: IIN, AAMVAVersion, JurisdictionVersion, numberOfEntries
    var m = data.match(/^@\n.\r(ANSI |AAMVA)(\d{6})(\d{2})(\d{2})(\d{2})/);
    if (!m) {
        return null
    }

    var obj = {
        header: {
            IIN: m[2],
            AAMVAVersion: parseInt(m[3]),
            jurisdictionVersion: parseInt(m[4]),
            numberOfEntries: parseInt(m[5])
        }
    };

    for (var i = 0; i < obj.header.numberOfEntries; i++) {
        var offset = 21 + i * 10
        m = data.substring(offset, offset + 10).match(/(.{2})(\d{4})(\d{4})/)
        var subfileType = m[1]
        var offset = parseInt(m[2])
        var length = parseInt(m[3])
        if (i === 0) {
          obj.files = [ subfileType ]
        } else {
          obj.files.push(subfileType)
        }
        obj[subfileType] = data.substring(offset + 2, offset + length).trim().split(/\n\r?/).reduce(function (p, c) {
            p[c.substring(0,3)] = c.substring(3);
            return p;
        }, { } )
    }

    // Convert from US MM/DD/CCYY date in local timezone
    function patchDate(str) {
        var m = str.match(/(\d{2})(\d{2})(\d{4})/)
        if (!m) return null
        var d = new Date(m[3] + "-" + m[1] + "-" + m[2])
        var offset = d.getTimezoneOffset() * 60 * 1000
        d.setTime(d.getTime() + offset)
        return d.getTime()
    }    
    
    if (obj.DL) {
        ["DBA", "DBB", "DBD", "DDB", "DDC", "DDH", "DDI", "DDJ"].forEach(function (k) {
            if (!obj.DL[k]) return
            var t = patchDate(obj.DL[k])
            if (!t) return
            obj.DL[k] = t
        } )
    }
    
    return obj
}
